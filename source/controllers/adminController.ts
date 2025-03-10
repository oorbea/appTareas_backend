import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user';
import Notification from '../models/notification';
import Task from '../models/task';
import TaskList from '../models/taskList';

dotenv.config();

class AdminController {
  public async createFirst (): Promise<void> {
    try {
      const username = process.env.ADMIN_USERNAME as string;
      const email = process.env.ADMIN_EMAIL as string;
      const password = process.env.ADMIN_PASSWORD as string;

      const existingAdmin = await User.findOne({ where: { email } });
      if (existingAdmin) {
        if (existingAdmin.enabled) {
          console.log('Admin ya registrado: ');
          console.log({
            id: existingAdmin.id,
            username: existingAdmin.username,
            email: existingAdmin.email,
            picture: existingAdmin.picture,
            admin: existingAdmin.admin,
            enabled: existingAdmin.enabled
          });
          return;
        }

        const tasks = await Task.findAll({ where: { user: existingAdmin.id } });
        for (const task of tasks) {
          await Notification.destroy({ where: { task: task.id } });
        }
        await Task.destroy({ where: { user: existingAdmin.id } });
        await TaskList.destroy({ where: { user: existingAdmin.id } });
        await User.destroy({ where: { email } });
      }
      const admin = await User.create({
        username,
        email,
        password,
        admin: true,
        enabled: true
      });

      console.log('Admin registrado: ');
      console.log({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        picture: admin.picture,
        admin: admin.admin,
        enabled: admin.enabled
      });
    } catch (error) {
      console.error('Error al registrar admin: ', error);
    }
  }

  public async create (req: Request, res: Response): Promise<void> {
    if (!req.user || !req.user.admin) {
      console.log(req.user);
      res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
      return;
    }
    try {
      const result = User.validate(req.body);
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
