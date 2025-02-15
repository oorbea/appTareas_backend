import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import User from '../models/user';

dotenv.config();

class Mailer {
  #transporter!: nodemailer.Transporter;
  constructor () {
    this.#transporter = nodemailer.createTransport({
      service: 'Gmail',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  public async sendPasswordResetEmail (email: string, token: string | number) {
    const user = await User.findOne({ where: { email, enabled: true } });
    const username = user ? user.username : 'Usuario';
    const mailOptions = {
      from: 'prioritease.noreply',
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
                <div class="content">
                    <p>Hola ${username},</p>
                    <p>Hemos recibido una solicitud para restablecer tu contraseña. Utiliza el siguiente código en los próximos 15 minutos para completar el proceso:</p>

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

    await this.#transporter.sendMail(mailOptions);
  }
}

export default Mailer;
