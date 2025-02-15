import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface UserPayload {
  id: number;
  username: string;
  email: string;
  admin: boolean;
  [key: string]: unknown;
}

declare module 'express' {
  interface Request {
    user?: UserPayload;
  }
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;

    if (!decoded) {
      res.status(403).json({ error: 'Token no válido o caducado' });
      return;
    }

    req.user = decoded;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error inesperado al autenticar usuario' });
  }
};

export default authenticate;
