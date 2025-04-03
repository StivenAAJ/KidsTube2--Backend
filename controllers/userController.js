const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Create a user
 *
 * @param {*} req
 * @param {*} res
 */
const userCreate = (req, res) => {
  let user = new User({
    email: req.body.email,
    number: req.body.number,
    pin: req.body.pin,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    country: req.body.country,
    birthday: req.body.birthday
  });

  // Encriptar la contraseña antes de guardarla
  if (req.body.password) {
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ error: 'Error al encriptar la contraseña' });
      }

      user.password = hashedPassword;  // Asignamos la contraseña encriptada

      user.save()
        .then(() => {
          res.status(201);
          res.header({ 'location': `/users/?id=${user.id}` }).json(user);
        })
        .catch(err => {
          res.status(422).json({ error: 'Error al guardar el usuario', details: err });
        });
    });
  } else {
    res.status(422).json({ error: 'La contraseña es obligatoria' });
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

const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Comparar contraseña (si está encriptada)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {// = No coincide
      return res.status(401).json({ error: "Credenciales incorrectas" });
      //status 401 = Unauthorized
    }

    // Crear token con JWT
    const token = jwt.sign({ id: user._id, email: user.email }, "User Token", {
      expiresIn: "2h",
    });

    res.json({ message: "Inicio de sesión exitoso", token, userId: user._id });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor", details: error });
    // status 500 = Internal Server Error
  }
};

const validateParentPin = async (req, res) => {
  const { userId, pin } = req.body;

  try {
    if (!userId || pin === undefined) {
      console.log("Faltan datos requeridos");
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    const parentUser = await User.findById(userId);
    console.log("Usuario encontrado en la BD:", parentUser);

    if (!parentUser) {
      console.log("Usuario no encontrado");
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (parentUser.pin !== Number(pin)) {
      console.log("PIN incorrecto");
      return res.status(401).json({ error: "PIN incorrecto" });
    }

    console.log("PIN correcto");
    res.json({ message: "PIN correcto" });

  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


module.exports = { userCreate, userGet, userDelete, userPatch, userLogin, validateParentPin };
