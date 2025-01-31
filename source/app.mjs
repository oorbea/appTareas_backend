import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { authenticatePublic, authenticateAdmin } from './authenticate.mjs';
import { connectDB, createTables } from './db.mjs';
import { User } from './models/user.mjs';
import { Admin, createAdmin } from './models/admin.mjs';
import { setupSwagger } from './swagger.mjs';
import { validateUser, validatePassword } from './validations.mjs';
import { sendPasswordResetEmail } from './utils/emailSender.mjs';
import { generateRandomNum } from './utils/randomNumberGenerator.mjs';

dotenv.config();

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ?? 5000;
const BASE_URL = `http://localhost:${PORT}`;

const JWT_SECRET = process.env.JWT_SECRET;

connectDB();
createTables();
createAdmin();

/**
 * @swagger
 * /prioritease_api/user/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     description: Crea un nuevo usuario en la base de datos.
 *     tags:
 *      - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nombre de usuario
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *               picture:
 *                 type: string
 *                 description: URL de la imagen de perfil del usuario
 *             example:
 *               username: batman
 *               email: bruce.wayne@example.com
 *               password: Password123
 *               picture: backend/profile_pictures/example.jpg
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     picture:
 *                       type: string
 *                     enabled:
 *                       type: boolean
 *       400:
 *         description: Campos obligatorios faltantes
 *       409:
 *         description: El correo electrónico ya está registrado
 *       500:
 *         description: Error interno del servidor
 */
app.post('/prioritease_api/user/register', async (req, res) => {
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
      picture,
      enabled: true
    });

    return res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        picture: newUser.picture,
        enabled: newUser.enabled
      }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor.' });
  }
});

/**
 * @swagger
 * /prioritease_api/user/login:
 *   post:
 *     summary: Inicia sesión de un usuario
 *     description: Autentica a un usuario y devuelve un token JWT.
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *             example:
 *               email: bruce.wayne@example.com
 *               password: Password123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Campos obligatorios faltantes
 *       401:
 *         description: Credenciales incorrectas
 *       500:
 *         description: Error interno del servidor
 */
app.post('/prioritease_api/user/login', async (req, res) => {
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
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ message: 'Se ha iniciado correctamente la sesión', token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
});

/**
 * @swagger
 * /prioritease_api/user/disable:
 *   patch:
 *     summary: Da de baja a un usuario
 *     description: |
 *       Deshabilita un usuario en la base de datos utilizando su token de inicio de sesión.
 *       El usuario debe estar autenticado y proporcionar un token JWT válido en el encabezado de la solicitud.
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []  # Requiere autenticación mediante JWT
 *     responses:
 *       200:
 *         description: Usuario dado de baja correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario dado de baja correctamente
 *       401:
 *         description: No autorizado. El token no fue proporcionado o es inválido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Token no proporcionado
 *       403:
 *         description: Prohibido. El token es inválido o ha caducado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Token no válido o caducado
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Ha ocurrido un error inesperado en el servidor
 */
app.patch('/prioritease_api/user/disable', authenticatePublic, async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await user.update({ enabled: false });
    return res.status(200).json({ message: 'Usuario dado de baja correctamente' });
  } catch (error) {
    console.error('Error al deshabilitar usuario:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
});

/**
 * @swagger
 * /prioritease_api/user:
 *   put:
 *     summary: Actualiza los atributos de un usuario
 *     description: Modifica los atributos de un usuario existente en la base de datos.
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []  # Requiere autenticación mediante JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nombre de usuario
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *               picture:
 *                 type: string
 *                 description: URL de la imagen de perfil del usuario
 *             example:
 *               username: batman
 *               email: bruce.wayne@example.com
 *               password: Newpassword123
 *               picture: backend/profile_pictures/new_example.jpg
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario actualizado exitosamente
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     picture:
 *                       type: string
 *                     enabled:
 *                       type: boolean
 *       400:
 *         description: Campos obligatorios faltantes
 *       401:
 *         description: No autorizado. El token no fue proporcionado o es inválido.
 *       403:
 *         description: Prohibido. El token es inválido o ha caducado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
app.put('/prioritease_api/user', authenticatePublic, async (req, res) => {
  const result = validateUser(req.body);
  if (result.error) return res.status(400).json({ error: result.error.issues[0].message });

  const { id } = req.user;
  const { username, email, password, picture } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user || !user.enabled) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const updatedData = {
      username: username ?? user.username,
      email: email ?? user.email,
      picture: picture ?? user.picture,
      password
    };

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
});

/**
 * @swagger
 * /prioritease_api/user/forgot_password:
 *   post:
 *     summary: Solicita un correo de restauración de contraseña.
 *     description: Genera un código de restauración para la cuenta asociada al correo electrónico proporcionado y envía un correo con el código. El código tiene una validez de 15 minutos.
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo electrónico asociado a la cuenta del usuario.
 *                 example: barack.obama@example.com
 *     responses:
 *       200:
 *         description: Correo de restauración enviado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Correo de restauración enviado correctamente
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario no encontrado
 *       500:
 *         description: Error inesperado en el servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ha ocurrido un error inesperado en el servidor
 */
app.post('/prioritease_api/user/forgot_password', async (req, res) => {
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
});

/**
 * @swagger
 * /prioritease_api/user/reset_password:
 *   patch:
 *     summary: Restablece la contraseña de un usuario.
 *     description: Permite a los usuarios restablecer su contraseña mediante un código de restauración válido. El código ha sido enviado previamente al correo electrónico del usuario y tiene un tiempo de expiración de 15 minutos.
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo electrónico asociado a la cuenta del usuario.
 *                 example: peter.parker@example.com
 *               code:
 *                 type: integer
 *                 description: Código de restauración de contraseña enviado al correo electrónico (8 dígitos).
 *                 example: 12345678
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña para la cuenta del usuario.
 *                 example: "PasswordSuperSeguro123"
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contraseña actualizada correctamente
 *       400:
 *         description: Solicitud inválida o código incorrecto/expirado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Código inválido o expirado
 *                 error:
 *                   type: string
 *                   description: Mensaje de validación de contraseña.
 *                   example: La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y un número.
 *       500:
 *         description: Error inesperado en el servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error en el servidor
 */
app.patch('/prioritease_api/user/reset_password', async (req, res) => {
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
});

/**
 * @swagger
 * /prioritease_api/user/{id}:
 *   get:
 *     summary: Obtiene la información de un usuario específico.
 *     description: Retorna los detalles de un usuario basado en su ID, siempre y cuando el usuario esté habilitado.
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []  # Requiere autenticación mediante JWT
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a buscar.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Información del usuario obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID del usuario.
 *                 username:
 *                   type: string
 *                   description: Nombre de usuario.
 *                 email:
 *                   type: string
 *                   description: Correo electrónico del usuario.
 *                 picture:
 *                   type: string
 *                   description: URL de la imagen de perfil del usuario.
 *       401:
 *         description: No autorizado. El token no fue proporcionado.
 *       403:
 *         description: No autorizado. El token es inválido o está caducado.
 *       404:
 *         description: Usuario no encontrado o no habilitado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ha ocurrido un error inesperado en el servidor"
 */
app.get('/prioritease_api/user/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;

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
});

/**
 * @swagger
 * /prioritease_api/user:
 *   get:
 *     summary: Obtiene una lista de todos los usuarios habilitados.
 *     description: Retorna una lista de usuarios habilitados con sus detalles básicos (ID, nombre de usuario, correo electrónico y foto de perfil).
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []  # Requiere autenticación mediante JWT
 *     responses:
 *       200:
 *         description: Lista de usuarios habilitados obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID del usuario.
 *                   username:
 *                     type: string
 *                     description: Nombre de usuario.
 *                   email:
 *                     type: string
 *                     description: Correo electrónico del usuario.
 *                   picture:
 *                     type: string
 *                     description: URL de la imagen de perfil del usuario.
 *       401:
 *         description: No autorizado. El token no fue proporcionado.
 *       403:
 *         description: No autorizado. El token es inválido o está caducado.
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ha ocurrido un error inesperado en el servidor"
 */
app.get('/prioritease_api/user', authenticateAdmin, async (req, res) => {
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
});

/**
 * @swagger
 * /prioritease_api/admin/login:
 *   post:
 *     summary: Iniciar sesión como administrador.
 *     description: Permite a un administrador autenticarse proporcionando un nombre de usuario y una contraseña. Si las credenciales son correctas, se devuelve un token JWT válido por 24 horas.
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nombre de usuario del administrador.
 *                 example: "admin123"
 *               password:
 *                 type: string
 *                 description: Contraseña del administrador.
 *                 example: "SuperSecreta123!"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Inicio de sesión exitoso
 *                 token:
 *                   type: string
 *                   description: Token JWT generado para autenticación.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Credenciales incorrectas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Usuario no encontrado o Contraseña incorrecta
 *       500:
 *         description: Error inesperado en el servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Ha ocurrido un error inesperado en el servidor
 */
app.post('/prioritease_api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    const token = jwt.sign({ username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
    return res.status(200).json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
});

app.get('/', (req, res) => {
  res.send('<h1>API PrioritEase</h1>');
});

setupSwagger(app);

app.use((req, res) => {
  res.status(404).send('<h1>404 - Página no encontrada</h1>');
});

app.listen(PORT, () => {
  console.log('Server is running on ' + BASE_URL);
});
