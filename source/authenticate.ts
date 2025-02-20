import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User, { UserPayload } from './models/user';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as UserPayload | null | undefined;
  } catch {
    res.status(403).json({ error: 'Token no válido o caducado' });
  }

  if (!decoded) {
    res.status(403).json({ error: 'Token no válido o caducado' });
    return;
  }

  const { id } = decoded;
  User.findByPk(id).then((user) => {
    if (!user || !user.enabled) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    req.user = decoded;
    next();
  })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: 'Error inesperado al autenticar usuario' });
    });
};

export default authenticate;
