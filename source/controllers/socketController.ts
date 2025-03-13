import { WebSocketServer } from 'ws';
import { CustomWebSocket } from '../../types/CustomWebSocket';
import jwt from 'jsonwebtoken';
import User, { UserPayload } from '../models/user';
import dotenv from 'dotenv';

dotenv.config();

export interface WebSocketMessage {
    type: 'notification' | 'welcome';
    data?: object;
}

export default class SocketController {
  public wss: WebSocketServer;
  protected JWT_SECRET: string;
  constructor () {
    this.wss = new WebSocketServer({ port: 8080 });
    this.JWT_SECRET = process.env.JWT_SECRET as string;

    this.authenticate();
  }

  public async authenticate (): Promise<void> {
    this.wss.on('connection', (ws: CustomWebSocket, req) => {
      console.log('Nuevo cliente conectado');

      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        console.error('Token no proporcionado');
        ws.close(4001, 'Token no proporcionado');
        return;
      }
      let decoded;
      try {
        decoded = jwt.verify(token, this.JWT_SECRET) as UserPayload;
      } catch (error) {
        console.error('Token no válido o caducado:', error);
        ws.close(4002, 'Token no válido o caducado');
        return;
      }
      User.findByPk(decoded.id)
        .then((user) => {
          if (!user || !user.enabled) {
            console.error('Usuario no encontrado o deshabilitado');
            ws.close(4003, 'Usuario no encontrado o deshabilitado');
            return;
          }

          ws.user = decoded;
          console.log(`Usuario ${decoded.username} conectado`);

          ws.on('message', (rawMessage) => {
            try {
              const message: WebSocketMessage = JSON.parse(rawMessage.toString());
              console.log(`Mensaje recibido de ${decoded.username}: ${message}`);
            } catch (error) {
              console.error('Formato de mensaje inválido:', error);
              ws.close(4005, 'Formato de mensaje inválido');
            }
          });

          ws.send(JSON.stringify({ type: 'welcome', data: { message: '¡Conexión exitosa!' } } as WebSocketMessage));
        })
        .catch((error) => {
          console.error('Error al autenticar usuario:', error);
          ws.close(4004, 'Error inesperado al autenticar usuario');
        });
    });
  }
}
