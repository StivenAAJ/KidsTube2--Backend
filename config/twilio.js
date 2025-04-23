const twilio = require('twilio');
require('dotenv').config();

// Verificar credenciales
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER?.replace(/\s+/g, ''); // Eliminar espacios

if (!accountSid || !authToken || !twilioPhone) {
  console.error('Faltan credenciales de Twilio');
  throw new Error('Credenciales de Twilio incompletas');
}

console.log('Configuración Twilio:', {
  accountSid: `${accountSid.slice(0,4)}...${accountSid.slice(-4)}`,
  phoneNumber: twilioPhone
});

const client = twilio(accountSid, authToken);

const sendSMS = async (to, code) => {
  try {
    // Formatear el número de teléfono
    const formattedTo = to.replace(/\s+/g, '');
    console.log('Enviando SMS:', {
      to: formattedTo,
      from: twilioPhone,
      code: code
    });

    const message = await client.messages.create({
      body: `Tu código de verificación de KidsTube es: ${code}`,
      from: twilioPhone,
      to: formattedTo
    });

    console.log('SMS enviado exitosamente:', {
      sid: message.sid,
      status: message.status
    });

    return true;
  } catch (error) {
    console.error('Error detallado al enviar SMS:', {
      message: error.message,
      code: error.code,
      status: error.status,
      moreInfo: error.moreInfo
    });
    throw error;
  }
};

module.exports = { sendSMS };