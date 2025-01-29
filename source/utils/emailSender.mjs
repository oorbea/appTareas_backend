import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
});

async function sendPasswordResetEmail (email, token) {
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: 'Restauración de contraseña',
    text: `Usa este código para restaurar tu contraseña: ${token}`
  };

  console.log('MY_EMAIL: ', EMAIL_USER);
  console.log('MY_PASSWORD: ', EMAIL_PASSWORD);
  console.log('Sending email to:', email);

  await transporter.sendMail(mailOptions);
}

export { sendPasswordResetEmail };
