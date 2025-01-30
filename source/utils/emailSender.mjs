import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { User } from '../models/user.mjs';

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
});

async function sendPasswordResetEmail (email, token) {
  const user = await User.findOne({ where: { email, enabled: true } });
  const username = user ? user.username : 'Usuario';
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: 'Restablecer Contraseña',
    html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Restablecer Contraseña</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border: 1px solid #dddddd;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .header {
                    background-color: #007bff;
                    color: #ffffff;
                    text-align: center;
                    padding: 20px;
                }
                .content {
                    padding: 20px;
                    color: #333333;
                }
                .code {
                    font-size: 24px;
                    font-weight: bold;
                    text-align: center;
                    margin: 20px 0;
                    padding: 10px;
                    background-color: #f8f9fa;
                    border: 1px solid #dddddd;
                    border-radius: 4px;
                }
                .button {
                    display: block;
                    width: 200px;
                    margin: 20px auto;
                    padding: 10px;
                    text-align: center;
                    background-color: #007bff;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 4px;
                }
                .footer {
                    text-align: center;
                    padding: 10px;
                    font-size: 12px;
                    color: #777777;
                    background-color: #f8f9fa;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>Restablecer Contraseña</h1>
                </div>

                <div class="content">
                    <p>Hola ${username},</p>
                    <p>Hemos recibido una solicitud para restablecer tu contraseña. Utiliza el siguiente código para completar el proceso:</p>

                    <div class="code">
                        ${token}
                    </div>

                    <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
                    <p>Gracias,</p>
                    <p>El equipo de PrioritEase</p>
                </div>

                <div class="footer">
                    <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
                </div>
            </div>
        </body>
        </html>
    `
  };

  await transporter.sendMail(mailOptions);
}

export { sendPasswordResetEmail };
