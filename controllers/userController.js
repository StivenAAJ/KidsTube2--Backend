const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const mongoose = require('mongoose');
const { sendVerificationEmail } = require('../config/mailer');
const { sendSMS } = require('../config/twilio');



const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
/**
 * Create a user
 *
 * @param {*} req
 * @param {*} res
 */
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET no está definido en las variables de entorno');
  process.exit(1);
}

const userCreate = async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);

    const requiredFields = ['email', 'password', 'number', 'pin', 'first_name', 'last_name', 'birthday'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(422).json({ 
        error: 'Campos requeridos faltantes', 
        fields: missingFields 
      });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(422).json({ error: 'El email ya está registrado' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      email: req.body.email,
      password: hashedPassword,
      number: req.body.number,
      pin: req.body.pin,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      country: req.body.country || 'No especificado',
      birthday: req.body.birthday,
      status: 'pending',
      verificationToken: verificationToken
    });

    const savedUser = await user.save();

    // Token para el proceso de registro
    const token = jwt.sign(
      { 
        id: savedUser._id, 
        email: savedUser.email,
        status: savedUser.status 
      }, 
      'User Token', // Mantenemos el token original para el registro
      { expiresIn: '2h' }
    );

    try {
      await sendVerificationEmail(savedUser.email, verificationToken, savedUser.first_name);
    } catch (emailError) {
      console.error('Error enviando email:', emailError);
    }

    res.status(201).json({
      message: "Usuario creado exitosamente",
      userId: savedUser._id,
      status: savedUser.status,
      token: token
    });

  } catch (error) {
    console.error('Error completo:', error);
    res.status(422).json({ 
      error: 'Error al crear el usuario', 
      details: error.message,
      stack: error.stack
    });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Intento de login:', email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // Generar código SMS
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Nuevo código SMS generado:", verificationCode);

    // Actualizar usuario con nuevo código
    user.smsVerificationCode = verificationCode;
    user.smsVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
    await user.save();

    console.log("Estado del usuario después de guardar:", {
      userId: user._id,
      smsVerificationCode: user.smsVerificationCode,
      smsVerificationExpires: user.smsVerificationExpires
    });

    // Enviar SMS
    const phoneNumber = user.number.startsWith('+') ? user.number : `+${user.number}`;
    await sendSMS(phoneNumber, verificationCode);

    // Token temporal
    const tempToken = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        requiresSmsVerification: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.json({
      message: "Código de verificación enviado",
      tempToken,
      requiresSmsVerification: true,
      userId: user._id.toString()
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const verifySmsCode = async (req, res) => {
  try {
    const { code, tempToken } = req.body;
    console.log("Datos recibidos en verificación:", { code, tempToken });

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    console.log("Token decodificado:", decoded);

    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    console.log("Estado actual del usuario:", {
      id: user._id,
      smsVerificationCode: user.smsVerificationCode,
      receivedCode: code,
      smsVerificationExpires: user.smsVerificationExpires,
      currentTime: new Date()
    });

    if (!user.smsVerificationCode) {
      return res.status(400).json({ error: "No hay código SMS pendiente" });
    }

    if (Date.now() > user.smsVerificationExpires) {
      return res.status(400).json({ error: "Código expirado" });
    }

    if (user.smsVerificationCode !== code) {
      return res.status(400).json({ error: "Código inválido" });
    }

    // Limpiar código después de verificación exitosa
    user.smsVerificationCode = undefined;
    user.smsVerificationExpires = undefined;
    await user.save();

    // Generar token final
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      userId: user._id.toString(),
      message: "Verificación exitosa"
    });

  } catch (error) {
    console.error("Error en verificación SMS:", error);
    res.status(500).json({ 
      error: "Error en la verificación",
      details: error.message 
    });
  }
};


const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    console.log('Token recibido en backend:', token);

    // Buscar todos los usuarios pendientes para debug
    const pendingUsers = await User.find({ status: 'pending' });
    console.log('Usuarios pendientes:', pendingUsers.map(u => ({
      email: u.email,
      verificationToken: u.verificationToken
    })));

    const user = await User.findOne({ verificationToken: token });
    console.log('Usuario encontrado:', user);

    if (!user) {
      console.log('No se encontró usuario con el token:', token);
      return res.status(404).json({ 
        error: 'Token de verificación inválido o expirado' 
      });
    }

    // Actualizar el estado del usuario
    user.status = 'active';
    user.verificationToken = undefined;
    await user.save();
    console.log('Usuario actualizado:', user);

    res.status(200).json({ 
      message: 'Email verificado exitosamente',
      userId: user._id
    });
  } catch (error) {
    console.error('Error completo en verificación:', error);
    res.status(500).json({ 
      error: 'Error al verificar el email',
      details: error.message 
    });
  }
};

/**
 * Get all users or a specific user by ID
 *
 * @param {*} req
 * @param {*} res
 */
const userGet = (req, res) => {
  if (req.query && req.query.id) {
    User.findById(req.query.id)
      .then(user => {
        if (user) {
          res.json(user);
        } else {
          res.status(404).json({ error: "El usuario no existe" });
        }
      })
      .catch(err => {
        res.status(500).json({ error: "Hubo un error al buscar el usuario", details: err });
      });
  } else {
    User.find()
      .then(users => res.json(users))
      .catch(err => res.status(422).json({ error: "Error al obtener los usuarios", details: err }));
  }
};

/**
 * Delete a user by ID
 *
 * @param {*} req
 * @param {*} res
 */
const userDelete = (req, res) => {
  if (req.params && req.params.id) {
    User.findByIdAndDelete(req.params.id)
      .then(user => {
        if (user) {
          res.status(204).json({});
        } else {
          res.status(404).json({ error: "El usuario no existe" });
        }
      })
      .catch(err => {
        res.status(500).json({ error: "Error al eliminar el usuario", details: err });
      });
  } else {
    res.status(400).json({ error: "Falta el ID del usuario" });
  }
};

/**
 * Update a user by ID (PATCH)
 *
 * @param {*} req
 * @param {*} res
 */
const userPatch = (req, res) => {
  if (req.params && req.params.id) {
    User.findById(req.params.id)
      .then(user => {
        if (!user) {
          return res.status(404).json({ error: "El usuario no existe" });
        }

        // Actualizar solo los campos enviados en el body
        user.email = req.body.email || user.email;
        user.password = req.body.password || user.password;
        user.number = req.body.number || user.number;
        user.pin = req.body.pin || user.pin;
        user.first_name = req.body.first_name || user.first_name;
        user.last_name = req.body.last_name || user.last_name;
        user.country = req.body.country || user.country;
        user.birthday = req.body.birthday || user.birthday;

        return user.save();
      })
      .then(updatedUser => res.status(200).json(updatedUser))
      .catch(err => res.status(422).json({ error: "Error al actualizar el usuario", details: err }));
  } else {
    res.status(400).json({ error: "Falta el ID del usuario" });
  }
};


const validateParentPin = async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);
    const { userId, pin } = req.body;

    // Validación mejorada de los datos de entrada
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.log("userId inválido:", userId);
      return res.status(400).json({ 
        error: "ID de usuario inválido",
        details: "Se requiere un ID de usuario válido"
      });
    }

    if (!pin) {
      console.log("PIN no proporcionado");
      return res.status(400).json({ 
        error: "PIN requerido",
        details: "Se requiere un PIN válido"
      });
    }

    // Validar que el userId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("ID no válido:", userId);
      return res.status(400).json({ 
        error: "ID de usuario inválido",
        details: "El formato del ID de usuario no es válido"
      });
    }

    console.log("Buscando usuario con ID:", userId);
    const parentUser = await User.findById(userId);

    if (!parentUser) {
      console.log("Usuario no encontrado para ID:", userId);
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Asegurarse de que ambos valores sean números para la comparación
    const storedPin = Number(parentUser.pin);
    const inputPin = Number(pin);

    console.log("Comparando PINs:", {
      storedPin,
      inputPin,
      match: storedPin === inputPin
    });

    if (storedPin !== inputPin) {
      return res.status(401).json({ error: "PIN incorrecto" });
    }

    res.json({ 
      message: "PIN correcto",
      userId: parentUser._id
    });

  } catch (error) {
    console.error("Error en validateParentPin:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      details: error.message 
    });
  }
};

// Función para verificar el estado del usuario
const checkUserStatus = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header recibido:', authHeader); // Debug

    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token a verificar:', token); // Debug

    // Usar JWT_SECRET en lugar de 'User Token'
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded); // Debug

    const user = await User.findById(decoded.userId);
    console.log('Usuario encontrado:', user ? {
      id: user._id,
      status: user.status
    } : 'No encontrado'); // Debug

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ 
      status: user.status,
      userId: user._id
    });

  } catch (error) {
    console.error('Error detallado en checkUserStatus:', error);
    
    // Mejorar el manejo de errores
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido',
        details: error.message 
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        details: error.message 
      });
    }

    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

const resendVerification = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'User Token'); // Mantenemos el token original para reenvío de verificación
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    await sendVerificationEmail(user.email, verificationToken, user.first_name);

    res.json({ message: 'Correo de verificación reenviado exitosamente' });
  } catch (error) {
    console.error('Error resending verification:', error);
    res.status(500).json({ error: 'Error al reenviar el correo de verificación' });
  }
};

module.exports = { userCreate, userGet, userDelete, userPatch, userLogin, validateParentPin, verifyEmail, checkUserStatus, resendVerification, verifySmsCode };
