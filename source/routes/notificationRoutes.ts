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

/**
 * @swagger
 * /prioritease_api/notification:
 *   get:
 *     summary: Obtiene las notificaciones del usuario autenticado
 *     description: |
 *       Recupera todas las notificaciones activas asociadas a las tareas del usuario autenticado.
 *       Se pueden aplicar filtros por ID de notificación, ID de tarea o fecha.
 *       Si se activa el filtro por id de notificación, se ignorarán los demás.
 *     tags:
 *       - Notificaciones
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: ID de la notificación a buscar
 *       - in: query
 *         name: task
 *         schema:
 *           type: integer
 *         description: Filtra las notificaciones por ID de tarea
 *       - in: query
 *         name: when
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtra las notificaciones por fecha y hora en formato ISO 8601
 *     responses:
 *       200:
 *         description: Lista de notificaciones recuperadas con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 123
 *                   when:
 *                     type: string
 *                     format: date-time
 *                     example: "2003-05-09T23:56:30Z"
 *                   task:
 *                     type: integer
 *                     example: 456
 *                   enabled:
 *                     type: boolean
 *                     example: true
 *       401:
 *         description: Usuario no autenticado
 *       404:
 *         description: La notificación o tarea no existe o está deshabilitada
 *       500:
 *         description: Error inesperado en el servidor
 */
router.get('/', authenticate, notCon.getMine);

export default router;
