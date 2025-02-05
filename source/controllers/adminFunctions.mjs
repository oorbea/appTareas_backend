import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.mjs';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await User.findOne({ where: { username, email: process.env.ADMIN_EMAIL } });
    if (!admin || !admin.enabled) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    const token = jwt.sign({ id: admin.id, username: admin.username, email: admin.email, admin: admin.admin }, JWT_SECRET, { expiresIn: '24h' });
    return res.status(200).json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

export { adminLogin };
