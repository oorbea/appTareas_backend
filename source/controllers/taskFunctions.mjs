import { Task } from '../models/task.mjs';
import { TaskList } from '../models/taskList.mjs';
import { validateTask, validateTaskUser } from '../validations.mjs';

const createTask = async (req, res) => {
  const result = validateTask(req.body);
  if (result.error) return res.status(400).json({ error: result.error.issues[0].message });

  const user = req.user.id;
  const { title, details, deadline, parent, difficulty, lat, lng, list, favourite, done } = req.body;

  try {
    if ((typeof lat === 'number' && typeof lng !== 'number') || (typeof lat !== 'number' && typeof lng === 'number')) return res.status(400).json({ error: 'Ubicación de la tarea incorrecta' });

    if (parent) {
      const taskParent = await Task.findByPk(parent);
      if (!taskParent || !taskParent.enabled || taskParent.user !== user) return res.status(404).json({ error: 'La tarea padre no existe' });
    }

    if (list) {
      const taskList = await TaskList.findByPk(list);
      if (!taskList || !taskList.enabled || taskList.user !== user) return res.status(404).json({ error: 'La lista de tareas no existe' });
    }

    const task = await Task.create({
      user,
      title,
      details,
      deadline,
      parent,
      difficulty,
      lat,
      lng,
      list,
      favourite,
      done
    });

    return res.status(201).json({
      message: 'Tarea creada exitosamente',
      task: {
        id: task.id,
        user: task.user,
        title: task.title,
        details: task.details,
        deadline: task.deadline,
        parent: task.parent,
        difficulty: task.difficulty,
        lat: task.lat,
        lng: task.lng,
        list: task.list,
        favourite: task.favourite,
        done: task.done
      }
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

const createTaskAdmin = async (req, res) => {
  if (!req.user.admin) return res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });

  let result = validateTask(req.body);
  if (result.error) return res.status(400).json({ error: result.error.issues[0].message });

  let user = req.params.user;
  if (!user) return res.status(400).json({ error: 'El usuario es requerido' });
  if (typeof user === 'string') user = parseInt(user);
  result = validateTaskUser({ user });
  if (result.error) return res.status(400).json({ error: result.error.issues[0].message });

  const { title, details, deadline, parent, difficulty, lat, lng, list, favourite, done } = req.body;

  try {
    if ((typeof lat === 'number' && typeof lng !== 'number') || (typeof lat !== 'number' && typeof lng === 'number')) return res.status(400).json({ error: 'Ubicación de la tarea incorrecta' });

    if (parent) {
      const taskParent = await Task.findByPk(parent);
      if (!taskParent || !taskParent.enabled || taskParent.user !== user) return res.status(404).json({ error: 'La tarea padre no existe' });
    }

    if (list) {
      const taskList = await TaskList.findByPk(list);
      if (!taskList || !taskList.enabled || taskList.user !== user) return res.status(404).json({ error: 'La lista de tareas no existe' });
    }

    const task = await Task.create({
      user,
      title,
      details,
      deadline,
      parent,
      difficulty,
      lat,
      lng,
      list,
      favourite,
      done
    });

    return res.status(201).json({
      message: 'Tarea creada exitosamente',
      task: {
        id: task.id,
        user: task.user,
        title: task.title,
        details: task.details,
        deadline: task.deadline,
        parent: task.parent,
        difficulty: task.difficulty,
        lat: task.lat,
        lng: task.lng,
        list: task.list,
        favourite: task.favourite,
        done: task.done
      }
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    return res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
  }
};

export { createTask, createTaskAdmin };
