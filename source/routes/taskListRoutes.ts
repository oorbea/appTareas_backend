import express from 'express';
import authenticate from '../authenticate';
import TLController from '../controllers/taskListController';

const router = express.Router();

/**
 * @swagger
 * /prioritease_api/task_list:
 *   post:
 *     summary: Crea una nueva lista de tareas para el usuario autenticado.
 *     description: Permite a un usuario autenticado crear una nueva lista de tareas con un nombre específico.
 *     tags:
 *       - Listas de Tareas
 *       - Public
 *     security:
 *       - bearerAuth: [] # Requiere autenticación mediante JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la lista de tareas.
 *                 example: "Tareas del Hogar"
 *     responses:
 *       201:
 *         description: Lista de tareas creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lista de tareas creada exitosamente
 *                 taskList:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Tareas del Hogar"
 *                     user:
 *                       type: integer
 *                       example: 123
 *       400:
 *         description: Error de validación en los datos proporcionados.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El nombre es requerido"
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
 *       409:
 *         description: Ya existe una lista de tareas con ese nombre.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Ya existe una lista de tareas con ese nombre
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
router.post('/', authenticate, TLController.createPublic);

/**
   * @swagger
   * /prioritease_api/task_list/{user}:
   *   post:
   *     summary: Crea una nueva lista de tareas para el usuario de id especificada.
   *     description: Permite a un administrador autenticado crear una nueva lista de tareas con un nombre específico para un usuario cualquiera.
   *     tags:
   *       - Listas de Tareas
   *       - Admin
   *     security:
   *       - bearerAuth: [] # Requiere autenticación de admin mediante JWT
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID del usuario al que le van a crear la lista.
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 description: Nombre de la lista de tareas.
   *                 example: "Tareas del Hogar"
   *     responses:
   *       201:
   *         description: Lista de tareas creada exitosamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Lista de tareas creada exitosamente
   *                 taskList:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     name:
   *                       type: string
   *                       example: "Tareas del Hogar"
   *                     user:
   *                       type: integer
   *                       example: 123
   *       400:
   *         description: Error de validación en los datos proporcionados.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "El nombre es requerido"
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
   *       409:
   *         description: Ya existe una lista de tareas con ese nombre.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Ya existe una lista de tareas con ese nombre
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
router.post('/:user', authenticate, TLController.createAdmin);

/**
   * @swagger
   * /prioritease_api/task_list/all:
   *   get:
   *     summary: Obtiene todas las listas de tareas habilitadas (solo para administradores).
   *     description: Permite a un usuario administrador obtener todas las listas de tareas habilitadas en el sistema.
   *     tags:
   *       - Listas de Tareas
   *       - Admin
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Listas de tareas habilitadas obtenidas exitosamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                     example: 1
   *                   name:
   *                     type: string
   *                     example: "Tareas del Hogar"
   *                   user:
   *                     type: integer
   *                     example: 123
   *                   enabled:
   *                     type: boolean
   *                     example: true
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
   *         description: Usuario no tiene permisos de administrador.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: No tienes permisos para acceder a esta ruta
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
router.get('/all', authenticate, TLController.getAll);

/**
   * @swagger
   * /prioritease_api/task_list/user/{user}:
   *   get:
   *     summary: Obtiene las listas de tareas habilitadas de un usuario específico (solo para administradores).
   *     description: Permite a un usuario administrador obtener todas las listas de tareas habilitadas asociadas a un usuario específico.
   *     tags:
   *       - Listas de Tareas
   *       - Admin
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: user
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del usuario cuyas listas de tareas habilitadas se desean obtener.
   *     responses:
   *       200:
   *         description: Listas de tareas habilitadas obtenidas exitosamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                     example: 1
   *                   name:
   *                     type: string
   *                     example: "Tareas del Hogar"
   *                   user:
   *                     type: integer
   *                     example: 123
   *                   enabled:
   *                     type: boolean
   *                     example: true
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
   *         description: Usuario no tiene permisos de administrador.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: No tienes permisos para acceder a esta ruta
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
router.get('/user/:user', authenticate, TLController.getByUser);

/**
   * @swagger
   * /prioritease_api/task_list/id/{id}:
   *   get:
   *     summary: Obtiene una lista de tareas habilitada por su ID (solo para administradores).
   *     description: Permite a un usuario administrador obtener una lista de tareas habilitada específica por su ID.
   *     tags:
   *       - Listas de Tareas
   *       - Admin
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la lista de tareas habilitada que se desea obtener.
   *     responses:
   *       200:
   *         description: Lista de tareas habilitada obtenida exitosamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                     example: 1
   *                   name:
   *                     type: string
   *                     example: "Tareas del Hogar"
   *                   user:
   *                     type: integer
   *                     example: 123
   *                   enabled:
   *                     type: boolean
   *                     example: true
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
   *         description: Usuario no tiene permisos de administrador.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: No tienes permisos para acceder a esta ruta
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
router.get('/id/:id', authenticate, TLController.getById);

/**
   * @swagger
   * /prioritease_api/task_list:
   *   get:
   *     summary: Obtiene las listas de tareas habilitadas del usuario autenticado.
   *     description: Permite a un usuario autenticado obtener todas sus listas de tareas habilitadas.
   *     tags:
   *       - Listas de Tareas
   *       - Public
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Listas de tareas habilitadas obtenidas exitosamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                     example: 1
   *                   name:
   *                     type: string
   *                     example: "Tareas del Hogar"
   *                   user:
   *                     type: integer
   *                     example: 123
   *                   enabled:
   *                     type: boolean
   *                     example: true
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
router.get('/', authenticate, TLController.getMine);

/**
   * @swagger
   * /prioritease_api/task_list/name/{name}:
   *   get:
   *     summary: Obtiene una lista de tareas por nombre.
   *     description: Retorna una lista de tareas habilitada basada en el nombre proporcionado y el ID del usuario autenticado.
   *     tags:
   *       - Listas de Tareas
   *       - Public
   *     parameters:
   *       - in: path
   *         name: name
   *         required: true
   *         description: Nombre de la lista de tareas a buscar.
   *         schema:
   *           type: string
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de tareas encontrada.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   description: ID de la lista de tareas.
   *                 name:
   *                   type: string
   *                   description: Nombre de la lista de tareas.
   *                 user:
   *                   type: integer
   *                   description: ID del usuario propietario de la lista.
   *       401:
   *         description: Token no proporcionado.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Token no proporcionado"
   *       403:
   *         description: Token no válido o caducado.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Token no válido o caducado"
   *       404:
   *         description: Lista de tareas no encontrada.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Lista de tareas no encontrada"
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
router.get('/name/:name', authenticate, TLController.getByName);

/**
 * @swagger
 * /prioritease_api/task_list/disable/{id}:
 *   patch:
 *     summary: Deshabilita una lista de tareas específica.
 *     description: Desactiva una lista de tareas en la base de datos. Solo el propietario de la lista o un administrador pueden realizar esta acción.
 *     tags:
 *       - Listas de Tareas
 *       - Public
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la lista de tareas a deshabilitar.
 *     responses:
 *       200:
 *         description: Lista de tareas deshabilitada correctamente.
 *         content:
 *           application/json:
 *             example:
 *               message: "Lista de tareas deshabilitada correctamente"
 *               taskList:
 *                 id: 123
 *                 name: "Tareas del Hogar"
 *                 user: 12345
 *                 enabled: false
 *       400:
 *         description: ID no válido (si no es un número entero).
 *         content:
 *           application/json:
 *             example:
 *               error: "ID no válido"
 *       401:
 *         description: No se proporcionó token de autenticación.
 *         content:
 *           application/json:
 *             example:
 *               error: "Token no proporcionado"
 *       403:
 *         description: Token inválido o expirado, o usuario sin permisos para deshabilitar la lista.
 *         content:
 *           application/json:
 *             examples:
 *               token_expired:
 *                 value:
 *                   error: "Token no válido o caducado"
 *               unauthorized_user:
 *                 value:
 *                   error: "No tienes permisos para deshabilitar esta lista"
 *       404:
 *         description: La lista de tareas no existe o ya está deshabilitada.
 *         content:
 *           application/json:
 *             example:
 *               error: "Lista de tareas no encontrada"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               error: "Ha ocurrido un error inesperado en el servidor"
 */
router.patch('/disable/:id', authenticate, TLController.disable);

/**
   * @swagger
   * /prioritease_api/task_list/name/{id}:
   *   patch:
   *     summary: Actualiza el nombre de una lista de tareas.
   *     description: Modifica el nombre de una lista de tareas específica. Solo el propietario o un administrador pueden realizar esta acción.
   *     tags:
   *       - Listas de Tareas
   *       - Public
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la lista de tareas a actualizar.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Mi nueva lista"
   *           description: Nuevo nombre para la lista de tareas.
   *     responses:
   *       200:
   *         description: Nombre actualizado correctamente.
   *         content:
   *           application/json:
   *             example:
   *               message: "Nombre de la lista de tareas actualizado correctamente"
   *               taskList:
   *                 id: 123
   *                 name: "Mi nueva lista"
   *                 user: 12345
   *       400:
   *         description: Nombre no válido.
   *         content:
   *           application/json:
   *             example:
   *               error: "El nombre debe tener entre 1 y 30 caracteres"
   *       401:
   *         description: No se proporcionó token de autenticación.
   *         content:
   *           application/json:
   *             example:
   *               error: "Token no proporcionado"
   *       403:
   *         description: El usuario no tiene permisos para cambiar el nombre de esta lista.
   *         content:
   *           application/json:
   *             example:
   *               error: "No tienes permisos para cambiar el nombre de esta lista"
   *       404:
   *         description: Lista de tareas no encontrada o deshabilitada.
   *         content:
   *           application/json:
   *             example:
   *               error: "Lista de tareas no encontrada"
   *       409:
   *         description: Ya existe una lista de tareas con ese nombre.
   *         content:
   *           application/json:
   *             example:
   *               error: "Ya existe una lista de tareas con ese nombre"
   *       500:
   *         description: Error interno del servidor.
   *         content:
   *           application/json:
   *             example:
   *               error: "Ha ocurrido un error inesperado en el servidor"
   */
router.patch('/name/:id', authenticate, TLController.updateName);

/**
   * @swagger
   * /prioritease_api/task_list/{id}:
   *   put:
   *     summary: Actualiza una lista de tareas (Solo admin).
   *     description: Modifica los atributos de una lista de tareas, incluyendo su nombre, usuario y estado habilitado. Solo accesible para administradores.
   *     tags:
   *       - Listas de Tareas
   *       - Admin
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la lista de tareas a actualizar.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Nueva lista de tareas"
   *               user:
   *                 type: integer
   *                 example: 2
   *               enabled:
   *                 type: boolean
   *                 example: true
   *           description: Datos a actualizar en la lista de tareas.
   *     responses:
   *       200:
   *         description: Lista de tareas actualizada correctamente.
   *         content:
   *           application/json:
   *             example:
   *               message: "Lista de tareas actualizada correctamente"
   *       400:
   *         description: Datos de entrada no válidos.
   *         content:
   *           application/json:
   *             example:
   *               error: "El nombre debe tener entre 1 y 30 caracteres"
   *       401:
   *         description: No se proporcionó token de autenticación.
   *         content:
   *           application/json:
   *             example:
   *               error: "Token no proporcionado"
   *       403:
   *         description: Usuario sin permisos para modificar la lista (No es admin).
   *         content:
   *           application/json:
   *             example:
   *               error: "No tienes permisos para acceder a esta ruta"
   *       404:
   *         description: Lista de tareas no encontrada o deshabilitada.
   *         content:
   *           application/json:
   *             example:
   *               error: "Lista de tareas no encontrada"
   *       409:
   *         description: Ya existe una lista de tareas con el mismo nombre para el usuario.
   *         content:
   *           application/json:
   *             example:
   *               error: "Ya existe una lista de tareas con ese nombre"
   *       500:
   *         description: Error interno del servidor.
   *         content:
   *           application/json:
   *             example:
   *               error: "Ha ocurrido un error inesperado en el servidor"
   */
router.put('/:id', authenticate, TLController.update);

export default router;
