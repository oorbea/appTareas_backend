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
 *                   $ref: '#/components/schemas/NotificationComplete'
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
 *         name: user
 *         required: true
 *         description: ID del usuario poseedor de la tarea a la que se asociará la notificación
 *         schema:
 *           type: integer
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
 *                   $ref: '#/components/schemas/NotificationComplete'
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
router.post('/:user', authenticate, notCon.createAdmin);

/**
 * @swagger
 * /prioritease_api/notification:
 *   get:
 *     summary: Obtiene las notificaciones del usuario autenticado
 *     description: |
 *       Recupera todas las notificaciones activas asociadas a las tareas del usuario autenticado.
 *       Se pueden aplicar filtros.
 *       Si se activa el filtro por id de notificación, se ignorarán los demás.
 *     tags:
 *       - Notificaciones
 *       - Public
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
 *         name: scheduledTime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtra las notificaciones por fecha y hora en formato ISO 8601
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, sent, failed]
 *         description: Filtra las notificaciones por estado
 *       - in: query
 *         name: message
 *         schema:
 *           type: string
 *         description: Filtra las notificaciones por mensaje
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [reminder, deadline, recurring, urgent, custom]
 *         description: Filtra las notificaciones por tipo
 *     responses:
 *       200:
 *         description: Lista de notificaciones recuperadas con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NotificationComplete'
 *       401:
 *         description: Usuario no autenticado
 *       404:
 *         description: La notificación o tarea no existe o está deshabilitada
 *       500:
 *         description: Error inesperado en el servidor
 */
router.get('/', authenticate, notCon.getMine);

/**
 * @swagger
 * /prioritease_api/notification/all:
 *   get:
 *     summary: Obtiene todas las notificaciones
 *     description: |
 *       Recupera todas las notificaciones activas.
 *       Se pueden aplicar filtros.
 *       Si se activa el filtro por id de notificación, se ignorarán los demás.
 *     tags:
 *       - Notificaciones
 *       - Admin
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
 *         name: user
 *         schema:
 *           type: integer
 *         description: Filtra las notificaciones por ID de usuario
 *       - in: query
 *         name: scheduledTime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtra las notificaciones por fecha y hora en formato ISO 8601
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, sent, failed]
 *         description: Filtra las notificaciones por estado
 *       - in: query
 *         name: message
 *         schema:
 *           type: string
 *         description: Filtra las notificaciones por mensaje
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [reminder, deadline, recurring, urgent, custom]
 *         description: Filtra las notificaciones por tipo
 *       - in: query
 *     responses:
 *       200:
 *         description: Lista de notificaciones recuperadas con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NotificationComplete'
 *       401:
 *         description: Usuario no autenticado
 *       404:
 *         description: La notificación o tarea no existe o está deshabilitada
 *       500:
 *         description: Error inesperado en el servidor
 */
router.get('/all', authenticate, notCon.getAll);

/**
 * @swagger
 * /prioritease_api/notification/{id}:
 *   put:
 *     summary: Actualiza una notificación existente
 *     description: |
 *       Permite modificar una notificación ya existente, siempre que pertenezca al usuario autenticado o que el usuario sea administrador.
 *     tags:
 *       - Notificaciones
 *       - Public
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la notificación a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           $ref: '#/components/schemas/Notification'
 *     responses:
 *       200:
 *         description: Notificación actualizada con éxito
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/NotificationComplete'
 *       400:
 *         description: Error en la validación de los datos de entrada
 *       401:
 *         description: Usuario no autenticado
 *       404:
 *         description: La notificación o tarea no existe o está deshabilitada
 *       500:
 *         description: Error inesperado en el servidor
 */
router.put('/:id', authenticate, notCon.update);

/**
 * @swagger
 * /prioritease_api/notification/{id}:
 *   patch:
 *     summary: Deshabilita una notificación
 *     description: |
 *       Permite deshabilitar una notificación existente, siempre que pertenezca al usuario autenticado o que el usuario sea administrador.
 *     tags:
 *       - Notificaciones
 *       - Public
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la notificación a deshabilitar
 *     responses:
 *       200:
 *         description: Notificación deshabilitada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notificación deshabilitada con éxito"
 *                 notification:
 *                   $ref: '#/components/schemas/NotificationComplete'
 *       401:
 *         description: Usuario no autenticado
 *       404:
 *         description: La notificación no existe o ya está deshabilitada
 *       500:
 *         description: Error inesperado en el servidor
 */
router.patch('/:id', authenticate, notCon.disable);

export default router;
