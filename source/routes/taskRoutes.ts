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
 *     summary: Obtiene las tareas del usuario autenticado
 *     description: |
 *       Retorna una lista de tareas asociadas al usuario autenticado.
 *       Se pueden aplicar filtros mediante query params para buscar tareas específicas.
 *     tags:
 *       - Tareas
 *       - Public
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: ID único de la tarea
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filtra por el título de la tarea
 *       - in: query
 *         name: details
 *         schema:
 *           type: string
 *         description: Filtra por el contenido detallado de la tarea
 *       - in: query
 *         name: deadline
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtra por fecha límite de la tarea (YYYY-MM-DD)
 *       - in: query
 *         name: parent
 *         schema:
 *           type: integer
 *           nullable: true
 *         description: ID de la tarea padre (si aplica)
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: integer
 *         description: Nivel de dificultad de la tarea
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *           nullable: true
 *         description: Coordenada de latitud asociada a la tarea
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *           nullable: true
 *         description: Coordenada de longitud asociada a la tarea
 *       - in: query
 *         name: list
 *         schema:
 *           type: integer
 *           nullable: true
 *         description: ID de la lista a la que pertenece la tarea
 *       - in: query
 *         name: favourite
 *         schema:
 *           type: boolean
 *         description: Filtrar solo tareas marcadas como favoritas
 *       - in: query
 *         name: done
 *         schema:
 *           type: boolean
 *         description: Filtrar solo tareas completadas o pendientes
 *     responses:
 *       200:
 *         description: Lista de tareas obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       400:
 *         description: Algún parámetro de consulta no es válido
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Token inválido o caducado
 *       500:
 *         description: Error inesperado en el servidor
 */
router.get('/', authenticate, taskController.getMine);

/**
 * @swagger
 * /prioritease_api/task/all:
 *   get:
 *     summary: Obtiene todas las tareas (requiere permisos de administrador)
 *     description: |
 *       Retorna una lista con todas las tareas registradas en el sistema.
 *       Solo accesible para administradores. Se pueden aplicar filtros mediante query params.
 *     tags:
 *       - Tareas
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: ID único de la tarea
 *       - in: query
 *         name: user
 *         schema:
 *           type: integer
 *         description: ID del usuario propietario de la tarea
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filtra por el título de la tarea
 *       - in: query
 *         name: details
 *         schema:
 *           type: string
 *         description: Filtra por el contenido detallado de la tarea
 *       - in: query
 *         name: deadline
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtra por fecha límite de la tarea (YYYY-MM-DD)
 *       - in: query
 *         name: parent
 *         schema:
 *           type: integer
 *           nullable: true
 *         description: ID de la tarea padre (si aplica)
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: integer
 *         description: Nivel de dificultad de la tarea
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *           nullable: true
 *         description: Coordenada de latitud asociada a la tarea
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *           nullable: true
 *         description: Coordenada de longitud asociada a la tarea
 *       - in: query
 *         name: list
 *         schema:
 *           type: integer
 *           nullable: true
 *         description: ID de la lista a la que pertenece la tarea
 *       - in: query
 *         name: favourite
 *         schema:
 *           type: boolean
 *         description: Filtrar solo tareas marcadas como favoritas
 *       - in: query
 *         name: done
 *         schema:
 *           type: boolean
 *         description: Filtrar solo tareas completadas o pendientes
 *     responses:
 *       200:
 *         description: Lista de todas las tareas obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Acceso denegado (requiere permisos de administrador)
 *       500:
 *         description: Error inesperado en el servidor
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

/**
 * @swagger
 * /prioritease_api/task/details/{id}:
 *   patch:
 *     summary: Actualiza solo los detalles de una tarea
 *     description: Modifica los detalles de una tarea específica. Se requiere autenticación mediante un token JWT.
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
 *               details:
 *                 type: string
 *                 example: Mi carro me lo robaron anoche cuando dormía...
 *     responses:
 *       200:
 *         description: Los etalles de la tarea han sido actualizados correctamente
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
router.patch('/details/:id', authenticate, taskController.updateDetails);

/**
 * @swagger
 * /prioritease_api/task/deadline/{id}:
 *   patch:
 *     summary: Actualiza solo la fecha límite de una tarea
 *     description: Modifica la fecha límite de una tarea específica. Se requiere autenticación mediante un token JWT.
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
 *               deadline:
 *                 type: string
 *                 format: date
 *                 example: 2003-05-09
 *     responses:
 *       200:
 *         description: La fecha límite de la tarea ha sido actualizada correctamente
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
router.patch('/deadline/:id', authenticate, taskController.updateDeadline);

/**
 * @swagger
 * /prioritease_api/task/parent/{id}:
 *   patch:
 *     summary: Actualiza solo la tarea padre de una tarea
 *     description: Modifica la tarea padre de una tarea específica. Se requiere autenticación mediante un token JWT.
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
 *               parent:
 *                 type: integer
 *                 example: 1234567890
 *     responses:
 *       200:
 *         description: La tarea padre de la tarea ha sido actualizada correctamente
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
router.patch('/parent/:id', authenticate, taskController.updateParent);

/**
 * @swagger
 * /prioritease_api/task/difficulty/{id}:
 *   patch:
 *     summary: Actualiza solo la dificultad de una tarea
 *     description: Modifica la dificultad de una tarea específica. Se requiere autenticación mediante un token JWT.
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
 *               difficulty:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       200:
 *         description: La dificultad de la tarea ha sido actualizada correctamente
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
router.patch('/difficulty/:id', authenticate, taskController.updateDifficulty);

/**
 * @swagger
 * /prioritease_api/task/location/{id}:
 *   patch:
 *     summary: Actualiza solo la ubicación de una tarea
 *     description: Modifica la ubicación de una tarea específica. Se requiere autenticación mediante un token JWT.
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
 *               lat:
 *                 type: number
 *                 example: 12.42
 *               lng:
 *                 type: number
 *                 example: -69
 *     responses:
 *       200:
 *         description: La ubicación de la tarea ha sido actualizada correctamente
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
router.patch('/location/:id', authenticate, taskController.updateLocation);

/**
 * @swagger
 * /prioritease_api/task/list/{id}:
 *   patch:
 *     summary: Actualiza solo la lista de tareas de una tarea
 *     description: Modifica la lista de tareas de una tarea específica. Se requiere autenticación mediante un token JWT.
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
 *               list:
 *                 type: integer
 *                 example: 11
 *     responses:
 *       200:
 *         description: La lista de tareas de la tarea ha sido actualizada correctamente
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
router.patch('/list/:id', authenticate, taskController.updateList);

/**
 * @swagger
 * /prioritease_api/task/favourite/{id}:
 *   patch:
 *     summary: Actualiza solo el favorito de una tarea
 *     description: Modifica el favorito de una tarea específica. Se requiere autenticación mediante un token JWT.
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
 *               favourite:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: El favorito de la tarea ha sido actualizado correctamente
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
router.patch('/favourite/:id', authenticate, taskController.updateFavourite);

/**
 * @swagger
 * /prioritease_api/task/done/{id}:
 *   patch:
 *     summary: Actualiza solo el estado de una tarea
 *     description: Modifica el estado de una tarea específica. Se requiere autenticación mediante un token JWT.
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
 *               done:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: El estado de la tarea ha sido actualizado correctamente
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
router.patch('/done/:id', authenticate, taskController.updateDone);

/**
 * @swagger
 * /prioritease_api/task/disable/{id}:
 *   patch:
 *     summary: Deshabilita una tarea
 *     description: Deshabilita una tarea específica en la base de datos. Se requiere autenticación mediante un token JWT.
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
 *         description: ID de la tarea a deshabilitar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: La tarea ha sido deshabilitada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No autorizado para actualizar la tarea
 *       404:
 *         description: Tarea no encontrada
 *       500:
 *         description: Error inesperado en el servidor
 */
router.patch('/disable/:id', authenticate, taskController.disable);

export default router;
