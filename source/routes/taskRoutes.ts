import express from 'express';
import authenticate from '../authenticate';
import taskController from '../controllers/taskController';

const router = express.Router();

/**
 * @swagger
 * /prioritease_api/task:
 *   post:
 *     summary: Crea una nueva tarea para el usuario autenticado.
 *     description: Permite a un usuario autenticado crear una nueva tarea con las características que especifique.
 *     tags:
 *       - Tareas
 *       - Public
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Task"
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Task"
 *       400:
 *         description: Error de validación en los datos proporcionados.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: El título es requerido
 *       401:
 *         description: Token no proporcionado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No autorizado
 *       403:
 *         description: Token inválido o caducado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No autorizado
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
router.post('/', authenticate, taskController.createPublic);

/**
 * @swagger
 * /prioritease_api/task/{user}:
 *   post:
 *     summary: Crea una nueva tarea para un usuario cualquiera.
 *     description: Solo los usuarios administradores pueden atacar este endpoint. Se requiere autenticación mediante un token JWT.
 *     tags:
 *       - Tareas
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user
 *         required: true
 *         schema:
 *           type: integer
 *           example: 123
 *         description: ID del usuario al que se le asignará la tarea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tarea creada exitosamente"
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Error de validación en la entrada de datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: El título es obligatorio
 *       401:
 *         description: No autenticado (token no proporcionado)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Token no proporcionado
 *       403:
 *         description: Acceso denegado (token inválido o usuario sin permisos)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No tienes permisos para acceder a esta ruta
 *       404:
 *         description: El usuario, la tarea padre o la lista de tareas no existen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: La tarea padre no existe
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Ha ocurrido un error inesperado en el servidor
 */
router.post('/:user', authenticate, taskController.createAdmin);

/**
   * @swagger
   * /prioritease_api/task:
   *   get:
   *     summary: Obtiene las tareas habilitadas del usuario autenticado.
   *     description: Permite a un usuario autenticado obtener todas sus tareas habilitadas.
   *     tags:
   *       - Tareas
   *       - Public
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Tareas habilitadas obtenidas exitosamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 schema:
   *                   $ref: "#/components/schemas/Task"
   *       401:
   *         description: Token no proporcionado o no válido.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Token no válido o caducado
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
router.get('/', authenticate, taskController.getMine);

/**
   * @swagger
   * /prioritease_api/task/all:
   *   get:
   *     summary: Obtiene todas las tareas habilitadas.
   *     description: Permite a un administrador autenticado obtener todas las tareas habilitadas.
   *     tags:
   *       - Tareas
   *       - Admin
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Tareas habilitadas obtenidas exitosamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 schema:
   *                   $ref: "#/components/schemas/Task"
   *       401:
   *         description: Token no proporcionado o no válido.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Token no válido o caducado
   *       403:
   *         description: No tienes permisos para acceder a esta ruta.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Token no válido o caducado
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
router.get('/all', authenticate, taskController.getAll);

/**
 * @swagger
 * /prioritease_api/task/id/{id}:
 *   get:
 *     summary: Obtiene una tarea por su ID
 *     description: Retorna la información de una tarea específica. Se requiere autenticación mediante un token JWT.
 *     tags:
 *       - Tareas
 *       - Public
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tarea a obtener
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos de la tarea obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 user:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 details:
 *                   type: string
 *                 deadline:
 *                   type: string
 *                   format: date
 *                 parent:
 *                   type: integer
 *                   nullable: true
 *                 difficulty:
 *                   type: integer
 *                 lat:
 *                   type: number
 *                 lng:
 *                   type: number
 *                 list:
 *                   type: integer
 *                 favourite:
 *                   type: boolean
 *                 done:
 *                   type: boolean
 *       400:
 *         description: ID de tarea no proporcionado o inválido
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Token inválido o caducado
 *       404:
 *         description: Tarea no encontrada o no disponible
 *       500:
 *         description: Error inesperado en el servidor
 */
router.get('/id/:id', authenticate, taskController.getById);

/**
 * @swagger
 * /prioritease_api/task/{id}:
 *   put:
 *     summary: Actualiza una tarea existente
 *     description: Modifica los datos de una tarea específica. Se requiere autenticación mediante un token JWT.
 *     tags:
 *       - Tareas
 *       - Public
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tarea a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: La tarea ha sido actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No autorizado para actualizar la tarea
 *       404:
 *         description: Tarea o usuario no encontrado
 *       500:
 *         description: Error inesperado en el servidor
 */
router.put('/:id', authenticate, taskController.update);

/**
 * @swagger
 * /prioritease_api/task/title/{id}:
 *   patch:
 *     summary: Actualiza solo el título de una tarea
 *     description: Modifica el título de una tarea específica. Se requiere autenticación mediante un token JWT.
 *     tags:
 *       - Tareas
 *       - Public
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la tarea a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Nuevo título de tarea
 *     responses:
 *       200:
 *         description: El título de la tarea ha sido actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No autorizado para actualizar la tarea
 *       404:
 *         description: Tarea no encontrada
 *       500:
 *         description: Error inesperado en el servidor
 */
router.patch('/title/:id', authenticate, taskController.updateTitle);

// router.patch('/details/:id', authenticate, taskController.updateDetails);
// router.patch('/deadline/:id', authenticate, taskController.updateDeadline);
// router.patch('/parent/:id', authenticate, taskController.updateParent);
// router.patch('/difficulty/:id', authenticate, taskController.updateDifficulty);
// router.patch('/location/:id', authenticate, taskController.updateLocation);
// router.patch('/list/:id', authenticate, taskController.updateList);
// router.patch('/favourite/:id', authenticate, taskController.updateFavourite);
// router.patch('/done/:id', authenticate, taskController.updateDone);
// router.patch('/disable/:id', authenticate, taskController.disable);

export default router;
