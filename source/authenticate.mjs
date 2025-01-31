import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticatePublic = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      return res.status(403).json({ error: 'Token no válido o caducado' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token no válido o caducado' });
  }
};

export const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      return res.status(403).json({ error: 'Token no válido o caducado' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token no válido o caducado' });
  }
};
