import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user';
import Validation from '../validations';

dotenv.config();

class AdminController {
  public async createFirst (): Promise<void> {
    try {
      const username = process.env.ADMIN_USERNAME as string;
      const email = process.env.ADMIN_EMAIL as string;
      const password = process.env.ADMIN_PASSWORD as string;

      const admin = await User.findOrCreate({
        where: { email },
        defaults: {
          username,
          email,
          password,
          admin: true,
          enabled: true
        }
      });

      if (admin[1]) console.log('Admin registrado: ');
      else console.log('Correo del admin ya registrado anteriormente: ');

      console.log({
        id: admin[0].id,
        username: admin[0].username,
        email: admin[0].email,
        picture: admin[0].picture,
        admin: admin[0].admin,
        enabled: admin[0].enabled
      });
    } catch (error) {
      console.error('Error al registrar admin:', error);
    }
  }

  public async create (req: Request, res: Response): Promise<void> {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
      return;
    }
    try {
      const result = Validation.validateUser(req.body);
      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }

      const { username, email, password, picture } = req.body;
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.enabled) {
        res.status(409).json({ error: 'El correo electrónico ya está registrado con otra cuenta.' });
        return;
      }

      await User.destroy({ where: { email } });

      const newUser = await User.create({
        username,
        email,
        password,
        picture: picture ?? null,
        admin: true,
        enabled: true
      });

      res.status(201).json({
        message: 'Usuario administrador registrado exitosamente.',
        admin: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          picture: newUser.picture,
          admin: newUser.admin,
          enabled: newUser.enabled
        }
      });
    } catch (error) {
      console.error('Error al registrar admin:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor.' });
    }
  }

  public async login (req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      const admin = await User.findOne({
        where: { username, email: process.env.ADMIN_EMAIL }
      });

      if (!admin || !admin.enabled) {
        res.status(401).json({ error: 'Usuario no encontrado' });
        return;
      }

      const isPasswordValid = await admin.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Contraseña incorrecta' });
        return;
      }

      const token = jwt.sign(
        {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          admin: admin.admin
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' }
      );

      res.status(200).json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }
}

const adminController = new AdminController();
export default adminController;
