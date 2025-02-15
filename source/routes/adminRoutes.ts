import express from 'express';
import aCon from '../controllers/adminController';
import authenticate from '../authenticate';

const router = express.Router();

/**
 * @swagger
 * /prioritease_api/admin/create:
 *   post:
 *     summary: Crea un nuevo usuario administrador.
 *     description: Este endpoint permite la creación de un nuevo usuario administrador en el sistema. Solo los usuarios autenticados con permisos de administrador pueden realizar esta acción.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nombre de usuario del administrador
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del administrador
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del administrador
 *               picture:
 *                 type: string
 *                 nullable: true
 *                 description: URL de la imagen de perfil (opcional)
 *     responses:
 *       201:
 *         description: Usuario administrador registrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario administrador registrado exitosamente.
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     picture:
 *                       type: string
 *                       nullable: true
 *                     admin:
 *                       type: boolean
 *                     enabled:
 *                       type: boolean
 *       400:
 *         description: Datos de entrada inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Token no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       403:
 *         description: El usuario autenticado no tiene permisos de administrador.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       409:
 *         description: El correo electrónico ya está registrado con otra cuenta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Error inesperado en el servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/create', authenticate, aCon.create);

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
router.post('/login', aCon.login);

export default router;
