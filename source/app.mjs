import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticate } from './authenticate.mjs';
import { connectDB, createTables } from './db.mjs';
import { User } from './models/user.mjs';
import { setupSwagger } from './swagger.mjs';

dotenv.config();

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

setupSwagger(app);

const PORT = process.env.PORT ?? 5000;
const BASE_URL = `http://localhost:${PORT}`;

const JWT_SECRET = process.env.JWT_SECRET;

connectDB();
createTables();

/**
 * @swagger
 * /prioritease_api/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     description: Crea un nuevo usuario en la base de datos.
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
 *               password: password123
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
app.post('/prioritease_api/register', async (req, res) => {
  const { username, email, password, picture } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Los campos obligatorios (username, email, password) deben ser proporcionados.' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'El correo electrónico ya está registrado con otra cuenta.' });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      picture
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
 * /prioritease_api/login:
 *   post:
 *     summary: Inicia sesión de un usuario
 *     description: Autentica a un usuario y devuelve un token JWT.
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
 *               password: password123
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
app.post('/prioritease_api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Se requiere email y password' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
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

    return res.json({ message: 'Se ha iniciado correctamente la sesión', token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
});

app.use((req, res) => {
  res.status(404).send('<h1>404 - Página no encontrada</h1>');
});

app.listen(PORT, () => {
  console.log('Server is running on ' + BASE_URL);
});
