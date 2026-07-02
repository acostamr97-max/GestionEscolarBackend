const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },
});

const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: '"Gestión Escolar" <no-reply@escuela.com>',
    to: email,
    subject: 'Verifica tu cuenta escolar',
    html: `<p>Para activar tu usuario, haz clic en el siguiente enlace:</p><a href="${url}">Verificar Cuenta</a>`
  });
};

module.exports = { sendVerificationEmail };