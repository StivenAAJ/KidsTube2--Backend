const nodemailer = require('nodemailer');
require('dotenv').config();

// Crear el transporter de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,        // Usar variable de entorno
        pass: process.env.GMAIL_APP_PASSWORD  // Usar variable de entorno
    }
});

const sendVerificationEmail = async (email, token, firstName) => {
    try {
        // Verificar que tenemos las credenciales
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            throw new Error('Credenciales de correo no configuradas');
        }

        const mailOptions = {
            from: process.env.GMAIL_USER,  // Usar la misma variable de entorno
            to: email,
            subject: 'Verifica tu cuenta de KidsTube',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #2563eb; text-align: center;">¡Bienvenido a KidsTube!</h1>
                    <p style="text-align: center;">Hola ${firstName || 'Usuario'}, gracias por registrarte.</p>
                    <p style="text-align: center;">Por favor, verifica tu cuenta haciendo clic en el siguiente botón:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}" 
                           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Verificar mi cuenta
                        </a>
                    </div>
                    <p style="text-align: center; color: #666; font-size: 12px;">
                        Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                        ${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}
                    </p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email enviado:', result);
        return true;
    } catch (error) {
        console.error('Error al enviar email:', error);
        throw new Error('Error al enviar el correo de verificación');
    }
};

module.exports = { sendVerificationEmail };