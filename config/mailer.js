const mailjet = require('node-mailjet').apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_API_SECRET
);
require('dotenv').config();

const sendVerificationEmail = async (email, token, firstName) => {
    try {
        const request = mailjet.post('send', { version: 'v3.1' }).request({
            Messages: [
                {
                    From: {
                        Email: process.env.MAILJET_VERIFIED_SENDER,
                        Name: 'KidsTube',
                    },
                    To: [
                        {
                            Email: email,
                            Name: firstName || 'Usuario',
                        },
                    ],
                    Subject: 'Verifica tu cuenta de KidsTube',
                    HTMLPart: `
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
                    `,
                },
            ],
        });

        const result = await request;
        console.log('Email enviado:', result.body);
        return true;
    } catch (error) {
        console.error('Error al enviar email:', error);
        throw new Error('Error al enviar el correo de verificación');
    }
};

module.exports = { sendVerificationEmail };