import { TaskList } from '../models/taskList.mjs';
import { validateTaskListName, validateTaskList } from '../validations.mjs';
import { User } from '../models/user.mjs';

const createTaskList = async (req, res) => {
  const user = req.user.id;
  const { name } = req.body;
  const result = validateTaskListName({ name });
  if (result.error) return res.status(400).json({ error: result.error.issues[0].message });

  try {
    let taskList = await TaskList.findOne({ where: { name, user } });
    if (taskList) return res.status(409).json({ error: 'Ya existe una lista de tareas con ese nombre' });

    taskList = await TaskList.create({ name, user });
    return res.status(201).json({
      message: 'Lista de tareas creada exitosamente',
      taskList: { id: taskList.id, name: taskList.name, user: taskList.user }
    });
  } catch (error) {
    console.error('Error al crear lista de tareas:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const createTaskListAdmin = async (req, res) => {
  if (!req.user.admin) return res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });

  let user = req.params.user;
  if (typeof user === 'string') user = parseInt(user);

  const { name } = req.body;
  const result = validateTaskListName({ name });
  if (result.error) return res.status(400).json({ error: result.error.issues[0].message });

  try {
    let taskList = await TaskList.findOne({ where: { name, user } });
    if (taskList) return res.status(409).json({ error: 'Ya existe una lista de tareas con ese nombre' });

    taskList = await TaskList.create({ name, user });
    return res.status(201).json({
      message: 'Lista de tareas creada exitosamente',
      taskList: { id: taskList.id, name: taskList.name, user: taskList.user }
    });
  } catch (error) {
    console.error('Error al crear lista de tareas:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const getAllTaskLists = async (req, res) => {
  if (!req.user.admin) return res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });

  try {
    const taskLists = await TaskList.findAll({
      attributes: ['id', 'name', 'user'],
      where: { enabled: true }
    });
    return res.status(200).json(taskLists);
  } catch (error) {
    console.error('Error al obtener listas de tareas:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const getTaskListsByUser = async (req, res) => {
  if (!req.user.admin) return res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });

  let user = req.params.user;
  if (typeof user === 'string') user = parseInt(user);

  try {
    const taskLists = await TaskList.findAll({
      attributes: ['id', 'name', 'user'],
      where: { user, enabled: true }
    });
    return res.status(200).json(taskLists);
  } catch (error) {
    console.error('Error al obtener listas de tareas:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const getTaskListById = async (req, res) => {
  if (!req.user.admin) return res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });

  let id = req.params.id;
  if (typeof id === 'string') id = parseInt(id);

  try {
    const taskList = await TaskList.findByPk(id);

    if (!taskList || !taskList.enabled) {
      return res.status(404).json({ error: 'Lista de tareas no encontrada' });
    }

    return res.status(200).json({
      id: taskList.id,
      name: taskList.name,
      user: taskList.user
    });
  } catch (error) {
    console.error('Error al obtener listas de tareas:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const getMyTaskLists = async (req, res) => {
  let user = req.user.id;
  if (typeof user === 'string') user = parseInt(user);

  try {
    const taskLists = await TaskList.findAll({
      attributes: ['id', 'name', 'user'],
      where: { user, enabled: true }
    });
    return res.status(200).json(taskLists);
  } catch (error) {
    console.error('Error al obtener listas de tareas:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const getTaskListByName = async (req, res) => {
  let user = req.user.id;
  if (typeof user === 'string') user = parseInt(user);

  const { name } = req.params;

  try {
    const taskList = await TaskList.findOne({
      attributes: ['id', 'name', 'user'],
      where: { user, name, enabled: true }
    });
    if (!taskList) return res.status(404).json({ error: 'Lista de tareas no encontrada' });
    return res.status(200).json(taskList);
  } catch (error) {
    console.error('Error al obtener listas de tareas:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const disableTaskList = async (req, res) => {
  let id = req.params.id;
  if (typeof id === 'string') id = parseInt(id);

  try {
    const taskList = await TaskList.findByPk(id);
    if (!taskList || !taskList.enabled) {
      return res.status(404).json({ error: 'Lista de tareas no encontrada' });
    }

    if (taskList.user !== req.user.id && !req.user.admin) return res.status(403).json({ error: 'No tienes permisos para deshabilitar esta lista' });

    await taskList.update({ enabled: false });
    return res.status(200).json({
      message: 'Lista de tareas deshabilitada correctamente',
      taskList: {
        id: taskList.id,
        name: taskList.name,
        user: taskList.user,
        enabled: taskList.enabled
      }
    });
  } catch (error) {
    console.error('Error al deshabilitar lista de tareas:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const updateTaskListName = async (req, res) => {
  let id = req.params.id;
  if (typeof id === 'string') id = parseInt(id);

  const user = req.user.id;

  const { name } = req.body;
  const result = validateTaskListName({ name });
  if (result.error) return res.status(400).json({ error: result.error.issues[0].message });

  try {
    const taskList = await TaskList.findByPk(id);
    if (!taskList || !taskList.enabled) {
      return res.status(404).json({ error: 'Lista de tareas no encontrada' });
    }

    const existingTaskList = await TaskList.findOne({ where: { name, user: taskList.user, enabled: true } });
    if (existingTaskList) return res.status(409).json({ error: 'Ya existe una lista de tareas con ese nombre' });

    if (taskList.user !== user && !req.user.admin) return res.status(403).json({ error: 'No tienes permisos para cambiar el nombre de esta lista' });

    await taskList.update({ name });
    return res.status(200).json({
      message: 'Nombre de la lista de tareas actualizado correctamente',
      taskList: {
        id: taskList.id,
        name: taskList.name,
        user: taskList.user
      }
    });
  } catch (error) {
    console.error('Error al cambiar el nombre a lista de tareas:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const updateTaskList = async (req, res) => {
  if (!req.user.admin) return res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });

  let id = req.params.id;
  if (typeof id === 'string') id = parseInt(id);

  const result = validateTaskList(req.body);
  if (result.error) return res.status(400).json({ error: result.error.issues[0].message });

  const { name, user, enabled } = req.body;
  try {
    const taskList = await TaskList.findByPk(id);
    if (!taskList || !taskList.enabled) return res.status(404).json({ error: 'Lista de tareas no encontrada' });

    const existingUser = await User.findByPk(user);
    if (!existingUser) return res.status(404).json({ error: 'Usuario no encontrado' });

    const existingTaskList = await TaskList.findOne({ where: { name, user, enabled: true } });
    if (existingTaskList && existingTaskList.id !== id) return res.status(409).json({ error: 'Ya existe una lista de tareas con ese nombre' });

    await taskList.update({
      name: name ?? taskList.name,
      user: user ?? taskList.user,
      enabled: enabled ?? taskList.enabled
    });

    return res.status(200).json({
      message: 'Lista de tareas actualizada correctamente',
      taskList: {
        name: taskList.name,
        user: taskList.user,
        enabled: taskList.enabled
      }
    });
  } catch (error) {
    console.error('Error al actualizar lista de tareas:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

export { createTaskList, createTaskListAdmin, getAllTaskLists, getTaskListsByUser, getTaskListById, getMyTaskLists, getTaskListByName, disableTaskList, updateTaskListName, updateTaskList };
