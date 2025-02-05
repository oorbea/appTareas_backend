import express from 'express';
import { authenticate } from '../authenticate.mjs';
import { uploadImage } from '../utils/upload.mjs';
import {
  registerUser,
  loginUser,
  disableUserPublic,
  disableUserAdmin,
  uploadProfilePicturePublic,
  uploadProfilePictureAdmin,
  getProfilePicturePublic,
  getProfilePictureAdmin,
  updateUserPublic,
  updateUserAdmin,
  forgotPassword,
  resetPassword,
  getUserByIdAdmin,
  getAllUsersAdmin,
  getUserPublic
} from '../controllers/userFunctions.mjs';

const router = express.Router();

/**
 * @swagger
 * /prioritease_api/user/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     description: Crea un nuevo usuario en la base de datos.
 *     tags:
 *      - Usuarios
 *      - Public
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/User"
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
router.post('/register', registerUser);

/**
 * @swagger
 * /prioritease_api/user/login:
 *   post:
 *     summary: Inicia sesión de un usuario
 *     description: Autentica a un usuario y devuelve un token JWT.
 *     tags:
 *       - Usuarios
 *       - Public
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
router.post('/login', loginUser);

/**
 * @swagger
 * /prioritease_api/user/disable:
 *   patch:
 *     summary: Da de baja a un usuario
 *     description: |
 *       El usuario se deshabilita en la base de datos utilizando su token de inicio de sesión.
 *       El usuario debe estar autenticado y proporcionar un token JWT válido en el encabezado de la solicitud.
 *     tags:
 *       - Usuarios
 *       - Public
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
 *                   example:
 *                     id: 123
 *                     username: Spiderman
 *                     email: peter.parker@example.com
 *                     picture: public/profile_pictures/spiderman.jpg
 *                     enabled: false
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
router.patch('/disable', authenticate, disableUserPublic);

/**
 * @swagger
 * /prioritease_api/user/disable/{id}:
 *   patch:
 *     summary: Da de baja a un usuario
 *     description: |
 *       El usuario se deshabilita en la base de datos utilizando un token de inicio de sesión de administrador.
 *       El admin debe estar autenticado y proporcionar un token JWT válido en el encabezado de la solicitud.
 *     tags:
 *       - Usuarios
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a dar de baja.
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []  # Requiere autenticación de admin mediante JWT
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
 *                   example:
 *                     id: 123
 *                     username: Spiderman
 *                     email: peter.parker@example.com
 *                     picture: public/profile_pictures/spiderman.jpg
 *                     enabled: false
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
router.patch('/disable/:id', authenticate, disableUserAdmin);

/**
   * @swagger
   * /prioritease_api/user/upload_picture:
   *   post:
   *     summary: Sube una foto de perfil para el usuario autenticado.
   *     description: Permite a un usuario autenticado subir una foto de perfil. La imagen se guarda en el servidor y se actualiza la URL en la base de datos.
   *     tags:
   *       - Usuarios
   *       - Public
   *     security:
   *       - bearerAuth: [] # Requiere autenticación mediante JWT
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               profilePicture:
   *                 type: string
   *                 format: binary
   *                 description: Archivo de imagen (JPEG, PNG, GIF) para la foto de perfil.
   *     responses:
   *       200:
   *         description: Imagen de perfil subida correctamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Imagen de perfil subida correctamente
   *                 picture:
   *                   type: string
   *                   example: public/uploads/1234567890-image.jpg
   *       400:
   *         description: No se proporcionó un archivo o el archivo no es válido.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: No se proporcionó un archivo
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
   *         description: Token no válido o caducado.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: No autorizado
   *       404:
   *         description: Usuario no encontrado o deshabilitado.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Usuario no encontrado o deshabilitado
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
router.post('/upload_picture', authenticate, uploadImage.single('profilePicture'), uploadProfilePicturePublic);

/**
   * @swagger
   * /prioritease_api/user/upload_picture/{id}:
   *   post:
   *     summary: Sube una foto de perfil para un usuario cualquiera.
   *     description: Permite a un administrador autenticado subir una foto de perfil para un usuario. La imagen se guarda en el servidor y se actualiza la URL en la base de datos.
   *     tags:
   *       - Usuarios
   *       - Admin
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID del usuario al que se le subirá la foto de perfil.
   *         schema:
   *           type: integer
   *     security:
   *       - bearerAuth: [] # Requiere autenticación de admin mediante JWT
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               profilePicture:
   *                 type: string
   *                 format: binary
   *                 description: Archivo de imagen (JPEG, PNG, GIF) para la foto de perfil.
   *     responses:
   *       200:
   *         description: Imagen de perfil subida correctamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Imagen de perfil subida correctamente
   *                 picture:
   *                   type: string
   *                   example: public/uploads/1234567890-image.jpg
   *       400:
   *         description: No se proporcionó un archivo o el archivo no es válido.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: No se proporcionó un archivo
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
   *         description: Token no válido o caducado.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: No autorizado
   *       404:
   *         description: Usuario no encontrado o deshabilitado.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Usuario no encontrado o deshabilitado
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
router.post('/upload_picture/:id', authenticate, uploadImage.single('profilePicture'), uploadProfilePictureAdmin);

/**
   * @swagger
   * /prioritease_api/user/picture:
   *   get:
   *     summary: Obtiene la imagen de perfil del usuario autenticado.
   *     description: Permite a un usuario autenticado obtener su imagen de perfil.
   *     tags:
   *       - Usuarios
   *       - Public
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Imagen de perfil obtenida exitosamente.
   *         content:
   *           image/*:
   *             schema:
   *               type: string
   *               format: binary
   *       401:
   *         description: No autorizado. El token no fue proporcionado.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Token no proporcionado
   *       403:
   *         description: No autorizado. El token no es válido o está caducado.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Token no válido o caducado
   *       404:
   *         description: Usuario no encontrado o no tiene imagen de perfil.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Usuario no encontrado o no tiene imagen de perfil
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
router.get('/picture', authenticate, getProfilePicturePublic);

/**
   * @swagger
   * /prioritease_api/user/picture/{id}:
   *   get:
   *     summary: Obtiene la imagen de perfil del usuario de id pasada por query params.
   *     description: Permite a un administrador obtener la imagen de perfil de un usuario.
   *     tags:
   *       - Usuarios
   *       - Admin
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID del usuario del que se obtendrá la imagen de perfil.
   *         schema:
   *         type: integer
   *     responses:
   *       200:
   *         description: Imagen de perfil obtenida exitosamente.
   *         content:
   *           image/*:
   *             schema:
   *               type: string
   *               format: binary
   *       401:
   *         description: No autorizado. El token no fue proporcionado.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Token no proporcionado
   *       403:
   *         description: No autorizado. El token no es válido o está caducado.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Token no válido o caducado
   *       404:
   *         description: Usuario no encontrado o no tiene imagen de perfil.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Usuario no encontrado o no tiene imagen de perfil
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
router.get('/picture/:id', authenticate, getProfilePictureAdmin);

/**
   * @swagger
   * /prioritease_api/user:
   *   put:
   *     summary: Actualiza los atributos de un usuario
   *     description: Modifica los atributos de un usuario autenticado si existe en la base de datos.
   *     tags:
   *       - Usuarios
   *       - Public
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
   *                 required: false
   *               email:
   *                 type: string
   *                 description: Correo electrónico del usuario
   *                 required: false
   *               password:
   *                 type: string
   *                 description: Contraseña del usuario
   *                 required: false
   *               picture:
   *                 type: string
   *                 description: URL de la imagen de perfil del usuario
   *                 required: false
   *             example:
   *               username: batman
   *               email: bruce.wayne@example.com
   *               password: Newpassword123
   *               picture: public/profile_pictures/new_example.jpg
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
router.put('/', authenticate, updateUserPublic);

/**
   * @swagger
   * /prioritease_api/user/{id}:
   *   put:
   *     summary: Actualiza los atributos de un usuario
   *     description: Modifica los atributos de un usuario existente en la base de datos.
   *     tags:
   *       - Usuarios
   *       - Admin
   *     security:
   *       - bearerAuth: []  # Requiere autenticación de admin mediante JWT
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
   *                 required: false
   *               email:
   *                 type: string
   *                 description: Correo electrónico del usuario
   *                 required: false
   *               password:
   *                 type: string
   *                 description: Contraseña del usuario
   *                 required: false
   *               picture:
   *                 type: string
   *                 description: URL de la imagen de perfil del usuario
   *                 required: false
   *             example:
   *               username: batman
   *               email: bruce.wayne@example.com
   *               password: Newpassword123
   *               picture: public/profile_pictures/new_example.jpg
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
router.put('/:id', authenticate, updateUserAdmin);

/**
   * @swagger
   * /prioritease_api/user/forgot_password:
   *   post:
   *     summary: Solicita un correo de restauración de contraseña.
   *     description: Genera un código de restauración para la cuenta asociada al correo electrónico proporcionado y envía un correo con el código. El código tiene una validez de 15 minutos.
   *     tags:
   *       - Usuarios
   *       - Public
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
router.post('/forgot_password', forgotPassword);

/**
   * @swagger
   * /prioritease_api/user/reset_password:
   *   patch:
   *     summary: Restablece la contraseña de un usuario.
   *     description: Permite a los usuarios restablecer su contraseña mediante un código de restauración válido. El código ha sido enviado previamente al correo electrónico del usuario y tiene un tiempo de expiración de 15 minutos.
   *     tags:
   *       - Usuarios
   *       - Public
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
router.patch('/reset_password', resetPassword);

/**
   * @swagger
   * /prioritease_api/user/id/{id}:
   *   get:
   *     summary: Obtiene la información de un usuario específico.
   *     description: Retorna los detalles de un usuario basado en su ID, siempre y cuando el usuario esté habilitado.
   *     tags:
   *       - Usuarios
   *       - Admin
   *     security:
   *       - bearerAuth: []  # Requiere autenticación de admin mediante JWT
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
router.get('/id/:id', authenticate, getUserByIdAdmin);

/**
   * @swagger
   * /prioritease_api/user/all:
   *   get:
   *     summary: Obtiene una lista de todos los usuarios habilitados.
   *     description: Retorna una lista de usuarios habilitados con sus detalles básicos (ID, nombre de usuario, correo electrónico y foto de perfil).
   *     tags:
   *       - Usuarios
   *       - Admin
   *     security:
   *       - bearerAuth: []  # Requiere autenticación de admin mediante JWT
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
router.get('/all', authenticate, getAllUsersAdmin);

/**
 * @swagger
 * /prioritease_api/user:
 *   get:
 *     summary: Obtiene la información del usuario autenticado.
 *     description: Retorna los detalles de un usuario basado en su token, siempre y cuando el usuario esté habilitado.
 *     tags:
 *       - Usuarios
 *       - Public
 *     security:
 *       - bearerAuth: []  # Requiere autenticación mediante JWT
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
router.get('/', authenticate, getUserPublic);

export default router;
