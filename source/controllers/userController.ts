import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import User from '../models/user';
import Task from '../models/task';
import TaskList from '../models/taskList';
import Notification from '../models/notification';
import Validation from '../validations';
import Mailer from '../utils/emailSender';
import generateRandomNum from '../utils/randomNumberGenerator';
import dotenv from 'dotenv';

dotenv.config();

class UserController {
  public async register (req: Request, res: Response): Promise<void> {
    try {
      const result = Validation.validateUser(req.body);
      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }

      const { username, email, password, picture } = req.body;
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        if (existingUser.enabled) {
          res.status(409).json({ error: 'El correo electrónico ya está registrado con otra cuenta.' });
          return;
        }
        await Notification.destroy({ where: { user: existingUser.id } });
        await Task.destroy({ where: { user: existingUser.id } });
        await TaskList.destroy({ where: { user: existingUser.id } });
        await User.destroy({ where: { email } });
      }

      const newUser = await User.create({
        username,
        email,
        password,
        picture: picture ?? null,
        admin: false,
        enabled: true
      });

      res.status(201).json({
        message: 'Usuario registrado exitosamente.',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          picture: newUser.picture,
          admin: newUser.admin,
          enabled: newUser.enabled
        }
      });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor.' });
    }
  }

  public async login (req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Se requiere email y password' });
        return;
      }
      const user = await User.findOne({ where: { email } });
      if (!user || !user.enabled) {
        res.status(401).json({ error: 'No hay usuarios con este email' });
        return;
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Contraseña incorrecta' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email, admin: user.admin },
        process.env.JWT_SECRET as string,
        { expiresIn: '720h' }
      );

      res.status(200).json({ message: 'Se ha iniciado correctamente la sesión', token });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async disablePublic (req: Request, res: Response): Promise<void> {
    // TODO: Cuando se deshabilita a un usuario, se debe deshabilitar también todas sus tareas, listas de tareas y notificaciones
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    try {
      const { id } = req.user;
      const user = await User.findByPk(id);

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      await user.update({ enabled: false });
      res.status(200).json({
        message: 'Usuario dado de baja correctamente',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          picture: user.picture,
          enabled: user.enabled
        }
      });
    } catch (error) {
      console.error('Error al deshabilitar usuario:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async disableAdmin (req: Request, res: Response): Promise<void> {
    // TODO: Cuando se deshabilita a un usuario, se debe deshabilitar también todas sus tareas, listas de tareas y notificaciones
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    try {
      const id: number = parseInt(req.params.id);
      const user = await User.findByPk(id);
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      await user.update({ enabled: false });
      res.status(200).json({
        message: 'Usuario dado de baja correctamente',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          picture: user.picture,
          enabled: user.enabled
        }
      });
    } catch (error) {
      console.error('Error al deshabilitar usuario:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async uploadProfilePicturePublic (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    try {
      const { id } = req.user;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: 'No se proporcionó un archivo' });
        return;
      }
      const user = await User.findByPk(id);
      if (!user || !user.enabled) {
        res.status(404).json({ error: 'Usuario no encontrado o deshabilitado' });
        return;
      }

      const picturePath = file.path;
      await user.update({ picture: picturePath });

      res.status(200).json({
        message: 'Imagen de perfil subida correctamente',
        picture: picturePath
      });
    } catch (error) {
      console.error('Error al subir imagen de perfil:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async uploadProfilePictureAdmin (req: Request, res: Response): Promise<void> {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    try {
      const id = parseInt(req.params.id);

      const file = req.file;

      if (!file) {
        res.status(400).json({ error: 'No se proporcionó un archivo' });
        return;
      }
      const user = await User.findByPk(id);
      if (!user || !user.enabled) {
        res.status(404).json({ error: 'Usuario no encontrado o deshabilitado' });
        return;
      }

      const picturePath = file.path;
      await user.update({ picture: picturePath });

      res.status(200).json({
        message: 'Imagen de perfil subida correctamente',
        picture: picturePath
      });
    } catch (error) {
      console.error('Error al subir imagen de perfil:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async getProfilePicturePublic (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    try {
      const { id } = req.user;
      const user = await User.findByPk(id);

      if (!user || !user.enabled) {
        res.status(404).json({ error: 'Usuario no encontrado o deshabilitado' });
        return;
      }

      if (!user.picture) {
        res.status(404).json({ error: 'El usuario no tiene una imagen de perfil' });
        return;
      }

      const imagePath = path.join(process.cwd(), user.picture);

      res.status(200).sendFile(imagePath);
    } catch (error) {
      console.error('Error al obtener la imagen de perfil:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async getProfilePictureAdmin (req: Request, res: Response): Promise<void> {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    try {
      const id = parseInt(req.params.id);
      const user = await User.findByPk(id);

      if (!user || !user.enabled) {
        res.status(404).json({ error: 'Usuario no encontrado o deshabilitado' });
        return;
      }

      if (!user.picture) {
        res.status(404).json({ error: 'El usuario no tiene una imagen de perfil' });
        return;
      }

      const imagePath = path.join(process.cwd(), user.picture);

      res.status(200).sendFile(imagePath);
    } catch (error) {
      console.error('Error al obtener la imagen de perfil:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async updatePublic (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    try {
      const { id } = req.user;
      if (!req.body) {
        res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });
        return;
      }
      const { username, email, password, picture } = req.body;

      if (username) {
        const usernameValidation = Validation.validateUsername({ username: req.body.username });
        if (usernameValidation.error) {
          res.status(400).json({ error: usernameValidation.error.issues[0].message });
          return;
        }
      }
      if (password) {
        const passwordValidation = Validation.validatePassword({ password: req.body.password });
        if (passwordValidation.error) {
          res.status(400).json({ error: passwordValidation.error.issues[0].message });
          return;
        }
      }
      if (email) {
        const emailValidation = Validation.validateEmail({ email: req.body.email });
        if (emailValidation.error) {
          res.status(400).json({ error: emailValidation.error.issues[0].message });
          return;
        }
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser && existingUser.enabled && existingUser.id !== id) {
          res.status(409).json({ error: 'El correo electrónico ya está registrado con otra cuenta.' });
          return;
        }
      }
      const user = await User.findByPk(id);
      if (!user || !user.enabled) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const updatedData = {
        username: username ?? user.username,
        email: email ?? user.email,
        picture: picture ?? user.picture
      };

      await user.update(updatedData);
      if (password) {
        await user.encryptPassword(password);
        await user.save();
      }

      res.status(200).json({
        message: 'Usuario actualizado exitosamente',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          picture: user.picture,
          enabled: user.enabled
        }
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async updateAdmin (req: Request, res: Response): Promise<void> {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    try {
      if (!req.body) {
        res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });
        return;
      }
      const id = parseInt(req.params.id);
      const user = await User.findByPk(id);

      const { username, email, password, picture } = req.body;

      if (username) {
        const usernameValidation = Validation.validateUsername({ username: req.body.username });
        if (usernameValidation.error) {
          res.status(400).json({ error: usernameValidation.error.issues[0].message });
          return;
        }
      }
      if (password) {
        const passwordValidation = Validation.validatePassword({ password: req.body.password });
        if (passwordValidation.error) {
          res.status(400).json({ error: passwordValidation.error.issues[0].message });
          return;
        }
      }
      if (email) {
        const emailValidation = Validation.validateEmail({ email: req.body.email });
        if (emailValidation.error) {
          res.status(400).json({ error: emailValidation.error.issues[0].message });
          return;
        }
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser && existingUser.enabled && existingUser.id !== id) {
          res.status(409).json({ error: 'El correo electrónico ya está registrado con otra cuenta.' });
          return;
        }
      }
      if (!user || !user.enabled) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const updatedData = {
        username: username ?? user.username,
        email: email ?? user.email,
        picture: picture ?? user.picture
      };

      await user.update(updatedData);
      if (password) {
        await user.encryptPassword(password);
        await user.save();
      }

      res.status(200).json({
        message: 'Usuario actualizado exitosamente',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          picture: user.picture,
          enabled: user.enabled
        }
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async forgotPassword (req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });

      if (!user || !user.enabled) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      const resetCode = generateRandomNum(10000000, 99999999);
      const resetCodeExpiration = new Date(Date.now() + 900000); // 15 minutos de expiración

      const updatedData = {
        resetPasswordCode: resetCode,
        resetPasswordExpires: resetCodeExpiration
      };

      await user.update(updatedData);

      await new Mailer().sendPasswordResetEmail(email, resetCode);

      res.status(200).json({ message: 'Correo de restauración enviado correctamente' });
    } catch (error) {
      console.error('error: ', error);
      res.status(500).json({ message: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async resetPassword (req: Request, res: Response): Promise<void> {
    try {
      let { code } = req.body;
      const { email, newPassword } = req.body;

      const result = Validation.validatePassword({ password: newPassword });

      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }
      if (typeof code === 'string') code = parseInt(code);
      const user = await User.findOne({ where: { email } });

      if (!user || !user.enabled) {
        res.status(400).json({ message: 'Email incorrecto' });
        return;
      }

      if (user.resetPasswordCode !== code || !user.resetPasswordExpires || user.resetPasswordExpires < new Date(Date.now())) {
        res.status(400).json({ message: 'Código de restauración inválido o expirado' });
        return;
      }

      const updatedData = {
        resetPasswordCode: null,
        resetPasswordExpires: null
      };

      await user.update(updatedData);
      await user.encryptPassword(newPassword);
      await user.save();

      res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      console.error('error: ', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }

  public async getByIdAdmin (req: Request, res: Response): Promise<void> {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    try {
      const id = parseInt(req.params.id);
      const user = await User.findByPk(id);

      if (!user || !user.enabled) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        picture: user.picture
      });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async getAllAdmin (req: Request, res: Response): Promise<void> {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    try {
      const users = await User.findAll({
        attributes: ['id', 'username', 'email', 'picture'],
        where: { enabled: true }
      });
      res.status(200).json(users);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async getPublic (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    try {
      const id = req.user.id;
      const user = await User.findByPk(id);

      if (!user || !user.enabled) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        picture: user.picture
      });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }
}

const userController = new UserController();
export default userController;
