import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { Op } from 'sequelize';
import { User } from '../models/user.mjs';
import { createFavouriteList } from '../models/taskList.mjs';
import { validateUser, validateUsername, validatePassword, validateEmail } from '../validations.mjs';
import { sendPasswordResetEmail } from '../utils/emailSender.mjs';
import { generateRandomNum } from '../utils/randomNumberGenerator.mjs';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const registerUser = async (req, res) => {
  const result = validateUser(req.body);
  if (result.error) return res.status(400).json({ error: result.error.issues[0].message });

  const { username, email, password, picture } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser && existingUser.enabled) {
      return res.status(409).json({ error: 'El correo electrónico ya está registrado con otra cuenta.' });
    }

    await User.destroy({ where: { email } });

    const newUser = await User.create({
      username,
      email,
      password,
      picture: picture ?? null,
      admin: false,
      enabled: true
    });

    await createFavouriteList(newUser);

    return res.status(201).json({
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
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor.' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Se requiere email y password' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.enabled) {
      return res.status(401).json({ error: 'No hay usuarios con este email' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, admin: user.admin },
      JWT_SECRET,
      { expiresIn: '720h' }
    );

    return res.status(200).json({ message: 'Se ha iniciado correctamente la sesión', token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const disableUserPublic = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await user.update({ enabled: false });
    return res.status(200).json({
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
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const disableUserAdmin = async (req, res) => {
  if (!req.user.admin) return res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });

  let { id } = req.params;
  if (typeof id === 'string') id = parseInt(id);
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await user.update({ enabled: false });
    return res.status(200).json({
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
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const uploadProfilePicturePublic = async (req, res) => {
  const { id } = req.user;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No se proporcionó un archivo' });
  }

  try {
    const user = await User.findByPk(id);
    if (!user || !user.enabled) {
      return res.status(404).json({ error: 'Usuario no encontrado o deshabilitado' });
    }

    const picturePath = file.path;
    await user.update({ picture: picturePath });

    return res.status(200).json({
      message: 'Imagen de perfil subida correctamente',
      picture: picturePath
    });
  } catch (error) {
    console.error('Error al subir imagen de perfil:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const uploadProfilePictureAdmin = async (req, res) => {
  if (!req.user.admin) return res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });

  let { id } = req.params;
  if (typeof id === 'string') id = parseInt(id);

  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No se proporcionó un archivo' });
  }

  try {
    const user = await User.findByPk(id);
    if (!user || !user.enabled) {
      return res.status(404).json({ error: 'Usuario no encontrado o deshabilitado' });
    }

    const picturePath = file.path;
    await user.update({ picture: picturePath });

    return res.status(200).json({
      message: 'Imagen de perfil subida correctamente',
      picture: picturePath
    });
  } catch (error) {
    console.error('Error al subir imagen de perfil:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const getProfilePicturePublic = async (req, res) => {
  const { id } = req.user;

  try {
    const user = await User.findByPk(id);
    if (!user || !user.enabled) {
      return res.status(404).json({ error: 'Usuario no encontrado o deshabilitado' });
    }

    if (!user.picture) {
      return res.status(404).json({ error: 'El usuario no tiene una imagen de perfil' });
    }

    const imagePath = path.join(process.cwd(), user.picture);

    return res.status(200).sendFile(imagePath);
  } catch (error) {
    console.error('Error al obtener la imagen de perfil:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const getProfilePictureAdmin = async (req, res) => {
  if (!req.user.admin) return res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });

  let { id } = req.params;
  if (typeof id === 'string') id = parseInt(id);

  try {
    const user = await User.findByPk(id);
    if (!user || !user.enabled) {
      return res.status(404).json({ error: 'Usuario no encontrado o deshabilitado' });
    }

    if (!user.picture) {
      return res.status(404).json({ error: 'El usuario no tiene una imagen de perfil' });
    }

    const imagePath = path.join(process.cwd(), user.picture);

    return res.status(200).sendFile(imagePath);
  } catch (error) {
    console.error('Error al obtener la imagen de perfil:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const updateUserPublic = async (req, res) => {
  if (!req.body) return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });

  const { id } = req.user;
  const { username, email, password, picture } = req.body;

  if (username) {
    const usernameValidation = validateUsername({ username: req.body.username });
    if (usernameValidation.error) return res.status(400).json({ error: usernameValidation.error.issues[0].message });
  }
  if (password) {
    const passwordValidation = validatePassword({ password: req.body.password });
    if (passwordValidation.error) return res.status(400).json({ error: passwordValidation.error.issues[0].message });
  }
  if (email) {
    const emailValidation = validateEmail({ email: req.body.email });
    if (emailValidation.error) return res.status(400).json({ error: emailValidation.error.issues[0].message });
  }

  try {
    const user = await User.findByPk(id);
    if (!user || !user.enabled) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const updatedData = {
      username: username ?? user.username,
      email: email ?? user.email,
      picture: picture ?? user.picture
    };
    if (password) {
      updatedData.password = password;
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser && existingUser.enabled && existingUser.id !== id) {
      return res.status(409).json({ error: 'El correo electrónico ya está registrado con otra cuenta.' });
    }

    await user.update(updatedData);

    return res.status(200).json({
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
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const updateUserAdmin = async (req, res) => {
  if (!req.user.admin) return res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });

  if (!req.body) return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });

  let { id } = req.params;
  if (typeof id === 'string') id = parseInt(id);
  const { username, email, password, picture } = req.body;

  if (username) {
    const usernameValidation = validateUsername({ username: req.body.username });
    if (usernameValidation.error) return res.status(400).json({ error: usernameValidation.error.issues[0].message });
  }
  if (password) {
    const passwordValidation = validatePassword({ password: req.body.password });
    if (passwordValidation.error) return res.status(400).json({ error: passwordValidation.error.issues[0].message });
  }
  if (email) {
    const emailValidation = validateEmail({ email: req.body.email });
    if (emailValidation.error) return res.status(400).json({ error: emailValidation.error.issues[0].message });
  }

  try {
    const user = await User.findByPk(id);
    if (!user || !user.enabled) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const updatedData = {
      username: username ?? user.username,
      email: email ?? user.email,
      picture: picture ?? user.picture
    };
    if (password) {
      updatedData.password = password;
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser && existingUser.enabled && existingUser.id !== id) {
      return res.status(409).json({ error: 'El correo electrónico ya está registrado con otra cuenta.' });
    }

    await user.update(updatedData);

    return res.status(200).json({
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
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.enabled) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const resetCode = generateRandomNum(10000000, 99999999);
    const resetCodeExpiration = Date.now() + 900000; // 15 minutos de expiración

    const updatedData = {
      resetPasswordCode: resetCode,
      resetPasswordExpires: resetCodeExpiration
    };

    await user.update(updatedData);

    await sendPasswordResetEmail(email, resetCode);

    return res.status(200).json({ message: 'Correo de restauración enviado correctamente' });
  } catch (error) {
    console.error('error: ', error);
    return res.status(500).json({ message: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const resetPassword = async (req, res) => {
  let { code } = req.body;
  const { email, newPassword } = req.body;

  const result = validatePassword({ password: newPassword });

  if (result.error) return res.status(400).json({ error: result.error.issues[0].message });

  if (typeof code === 'string') code = parseInt(code);

  try {
    const user = await User.findOne({
      where: {
        email,
        resetPasswordCode: code,
        resetPasswordExpires: { [Op.gt]: new Date() } // Código no expirado
      }
    });

    if (!user || !user.enabled) {
      return res.status(400).json({ message: 'Código inválido o expirado' });
    }

    const updatedData = {
      password: newPassword,
      resetPasswordCode: null,
      resetPasswordExpires: null
    };

    await user.update(updatedData);

    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('error: ', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const getUserByIdAdmin = async (req, res) => {
  if (!req.user.admin) return res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });

  let { id } = req.params;
  if (typeof id === 'string') id = parseInt(id);

  try {
    const user = await User.findByPk(id);
    if (!user || !user.enabled) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      picture: user.picture
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const getAllUsersAdmin = async (req, res) => {
  if (!req.user.admin) return res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });

  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'picture'],
      where: { enabled: true }
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const getUserPublic = async (req, res) => {
  let { id } = req.user.id;
  if (typeof id === 'string') id = parseInt(id);

  try {
    const user = await User.findByPk(id);
    if (!user || !user.enabled) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      picture: user.picture
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

export { registerUser, loginUser, disableUserPublic, disableUserAdmin, uploadProfilePicturePublic, uploadProfilePictureAdmin, getProfilePicturePublic, getProfilePictureAdmin, updateUserPublic, updateUserAdmin, forgotPassword, resetPassword, getUserByIdAdmin, getAllUsersAdmin, getUserPublic };
