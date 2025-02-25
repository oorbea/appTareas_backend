import express from 'express';
import authenticate from '../authenticate';
import notCon from '../controllers/notificationController';

const router = express.Router();

/**
 * @swagger
 * /prioritease_api/notification:
 *   post:
 *     summary: Crea una notificación para una tarea
 *     description: |
 *       Permite a un usuario autenticado crear una notificación asociada a una tarea.
 *       Si ya existe una notificación para la misma fecha y tarea, se reactiva en lugar de crear una nueva.
 *     tags:
 *       - Notificaciones
 *       - Public
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Notification'
 *     responses:
 *       201:
 *         description: Notificación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notificación creada exitosamente"
 *                 notification:
 *                   $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Datos de entrada no válidos
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No tienes permisos para acceder a esta ruta
 *       404:
 *         description: La tarea no existe o está deshabilitada
 *       409:
 *         description: Ya existe una notificación para esta tarea en la misma fecha y hora
 *       500:
 *         description: Error inesperado en el servidor
 */
router.post('/', authenticate, notCon.createPublic);

/**
 * @swagger
 * /prioritease_api/notification/{task}:
 *   post:
 *     summary: Crea una notificación para una tarea
 *     description: |
 *       Permite a un administrador autenticado crear una notificación asociada a una tarea de cualquier usuario.
 *       Si ya existe una notificación para la misma fecha y tarea, se reactiva en lugar de crear una nueva.
 *     tags:
 *       - Notificaciones
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: task
 *         required: true
 *         description: ID de la tarea a la que se asociará la notificación
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - when
 *             properties:
 *              when:
 *                  type: string
 *                  format: date-time
 *                  example: "2022-12-31T23:59:59Z"
 *     responses:
 *       201:
 *         description: Notificación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notificación creada exitosamente"
 *                 notification:
 *                   $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Datos de entrada no válidos
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No tienes permisos para acceder a esta ruta
 *       404:
 *         description: La tarea no existe o está deshabilitada
 *       409:
 *         description: Ya existe una notificación para esta tarea en la misma fecha y hora
 *       500:
 *         description: Error inesperado en el servidor
 */
router.post('/:task', authenticate, notCon.createAdmin);

export default router;
