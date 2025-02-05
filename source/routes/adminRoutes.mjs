import express from 'express';
import { adminLogin } from '../controllers/adminFunctions.mjs';

const router = express.Router();

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
router.post('/login', adminLogin);

export default router;
