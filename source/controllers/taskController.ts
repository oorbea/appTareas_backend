import { Request, Response } from 'express';
import dotenv from 'dotenv';
import Task from '../models/task';
import TaskList from '../models/taskList';
import User from '../models/user';

dotenv.config();

class TaskController {
  public async createPublic (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const result = Task.validate(req.body);
      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }
      const user = req.user.id;
      const { title, details, deadline, parent, difficulty, lat, lng, list, favourite, done } = req.body;

      if ((typeof lat === 'number' && typeof lng !== 'number') || (typeof lat !== 'number' && typeof lng === 'number')) {
        res.status(400).json({ error: 'Ubicación de la tarea incorrecta' });
        return;
      }

      if (parent) {
        const taskParent = await Task.findByPk(parent);
        if (!taskParent || !taskParent.enabled || taskParent.user !== user) {
          res.status(404).json({ error: 'La tarea padre no existe' });
          return;
        }
      }

      if (list) {
        const taskList = await TaskList.findByPk(list);
        if (!taskList || !taskList.enabled || taskList.user !== user) {
          res.status(404).json({ error: 'La lista de tareas no existe' });
          return;
        }
      }

      if (difficulty) {
        if (difficulty < 1 || difficulty > 5) {
          res.status(400).json({ error: 'La dificultad debe ser un número entre 1 y 5' });
          return;
        }
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

      res.status(201).json({
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
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async createAdmin (req: Request, res: Response): Promise<void> {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const result1 = Task.validate(req.body);
      if (result1.error) {
        res.status(400).json({ error: result1.error.issues[0].message });
        return;
      }

      const user = parseInt(req.params.user);
      if (!user) {
        res.status(400).json({ error: 'El usuario es requerido' });
        return;
      }
      const result2 = Task.validateUser({ user });
      if (result2.error) {
        res.status(400).json({ error: result2.error.issues[0].message });
        return;
      }
      const userExists = await User.findByPk(user);
      if (!userExists || !userExists.enabled) {
        res.status(404).json({ error: 'El usuario no existe' });
        return;
      }

      const { title, details, deadline, parent, difficulty, lat, lng, list, favourite, done } = req.body;
      if ((typeof lat === 'number' && typeof lng !== 'number') || (typeof lat !== 'number' && typeof lng === 'number')) {
        res.status(400).json({ error: 'Ubicación de la tarea incorrecta' });
        return;
      }

      if (parent) {
        const taskParent = await Task.findByPk(parent);
        if (!taskParent || !taskParent.enabled || taskParent.user !== user) {
          res.status(404).json({ error: 'La tarea padre no existe' });
          return;
        }
      }

      if (list) {
        const taskList = await TaskList.findByPk(list);
        if (!taskList || !taskList.enabled || taskList.user !== user) {
          res.status(404).json({ error: 'La lista de tareas no existe' });
          return;
        }
      }

      if (difficulty) {
        if (difficulty < 1 || difficulty > 5) {
          res.status(400).json({ error: 'La dificultad debe ser un número entre 1 y 5' });
          return;
        }
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

      res.status(201).json({
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
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async getMine (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const user = req.user.id;
      const tasks = await Task.findAll({
        attributes: ['id', 'user', 'title', 'details', 'deadline', 'parent', 'difficulty', 'lat', 'lng', 'list', 'favourite', 'done'],
        where: { user, enabled: true }
      });
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async getAll (req: Request, res: Response): Promise<void> {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const tasks = await Task.findAll({
        attributes: ['id', 'user', 'title', 'details', 'deadline', 'parent', 'difficulty', 'lat', 'lng', 'list', 'favourite', 'done'],
        where: { enabled: true }
      });
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async getById (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const user = req.user.id;
      const id = parseInt(req.params.id);
      if (!id) {
        res.status(400).json({ error: 'El ID de la tarea es requerido' });
        return;
      }
      const task = await Task.findByPk(id);
      if (!task || !task.enabled || (task.user !== user && !req.user.admin)) {
        res.status(404).json({ error: 'La tarea no existe' });
        return;
      }
      res.status(200).json({
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
      });
    } catch (error) {
      console.error('Error al obtener tarea:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async update (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const taskUser = req.user.id;
      const id = parseInt(req.params.id);

      const task = await Task.findByPk(id);
      if (!task || !task.enabled) {
        res.status(404).json({ error: 'La tarea no existe' });
        return;
      }
      if (task.user !== taskUser && !req.user.admin) {
        res.status(403).json({ error: 'No tienes permisos para actualizar esta tarea' });
        return;
      }
      const result = Task.validate(req.body);
      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }
      const { title, details, user, deadline, parent, difficulty, lat, lng, list, favourite, done, enabled } = req.body;

      if (parent) {
        const taskParent = await Task.findByPk(parent);
        if (!taskParent || !taskParent.enabled || taskParent.user !== taskUser || taskParent.id === id) {
          res.status(404).json({ error: 'La tarea padre no es válida' });
          return;
        }
      }
      if (difficulty) {
        if (difficulty < 1 || difficulty > 5) {
          res.status(400).json({ error: 'La dificultad debe ser un número entre 1 y 5' });
          return;
        }
      }

      if (lat || lng) {
        if ((typeof lat === 'number' && typeof lng !== 'number') || (typeof lat !== 'number' && typeof lng === 'number')) {
          res.status(400).json({ error: 'Ubicación de la tarea incorrecta' });
          return;
        }
      }

      if (list) {
        const taskList = await TaskList.findByPk(list);
        if (!taskList || !taskList.enabled || taskList.user !== taskUser) {
          res.status(404).json({ error: 'La lista de tareas no existe' });
          return;
        }
      }

      if (user) {
        if (!req.user.admin) {
          res.status(403).json({ error: 'No tienes permisos para actualizar el usuario de esta tarea' });
          return;
        }

        const result = Task.validateUser({ user });
        if (result.error) {
          res.status(400).json({ error: result.error.issues[0].message });
          return;
        }

        const userExists = await User.findByPk(user);
        if (!userExists || !userExists.enabled) {
          res.status(404).json({ error: 'El usuario no existe' });
          return;
        }

        await task.update({ user });
      }

      const updatedData = {
        title: title ?? task.title,
        details: details ?? task.details,
        deadline: deadline ?? task.deadline,
        parent: parent ?? task.parent,
        difficulty: difficulty ?? task.difficulty,
        lat: lat ?? task.lat,
        lng: lng ?? task.lng,
        list: list ?? task.list,
        favourite: favourite ?? task.favourite,
        done: done ?? task.done,
        enabled: enabled ?? task.enabled
      };

      await task.update(updatedData);

      res.status(200).json(task);
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async updateTitle (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const taskUser = req.user.id;
      const id = parseInt(req.params.id);

      const task = await Task.findByPk(id);
      if (!task || !task.enabled) {
        res.status(404).json({ error: 'La tarea no existe' });
        return;
      }
      if (task.user !== taskUser && !req.user.admin) {
        res.status(403).json({ error: 'No tienes permisos para actualizar esta tarea' });
        return;
      }
      const title = req.body.title;
      const result = Task.validateTitle({ title });
      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }

      await task.update({ title });

      res.status(200).json(task);
    } catch (error) {
      console.error('Error al actualizar título de tarea:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async updateDetails (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const taskUser = req.user.id;
      const id = parseInt(req.params.id);

      const task = await Task.findByPk(id);
      if (!task || !task.enabled) {
        res.status(404).json({ error: 'La tarea no existe' });
        return;
      }
      if (task.user !== taskUser && !req.user.admin) {
        res.status(403).json({ error: 'No tienes permisos para actualizar esta tarea' });
        return;
      }
      const details = req.body.details;
      const result = Task.validateDetails({ details });
      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }

      await task.update({ details });

      res.status(200).json(task);
    } catch (error) {
      console.error('Error al actualizar detalles de tarea:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async updateDeadline (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const taskUser = req.user.id;
      const id = parseInt(req.params.id);

      const task = await Task.findByPk(id);
      if (!task || !task.enabled) {
        res.status(404).json({ error: 'La tarea no existe' });
        return;
      }
      if (task.user !== taskUser && !req.user.admin) {
        res.status(403).json({ error: 'No tienes permisos para actualizar esta tarea' });
        return;
      }
      const deadline = req.body.deadline;
      const result = Task.validateDeadline({ deadline });
      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }

      await task.update({ deadline });

      res.status(200).json(task);
    } catch (error) {
      console.error('Error al actualizar fecha límite de tarea:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async updateParent (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const taskUser = req.user.id;
      const id = parseInt(req.params.id);

      const task = await Task.findByPk(id);
      if (!task || !task.enabled) {
        res.status(404).json({ error: 'La tarea no existe' });
        return;
      }
      if (task.user !== taskUser && !req.user.admin) {
        res.status(403).json({ error: 'No tienes permisos para actualizar esta tarea' });
        return;
      }
      const parent = req.body.parent;
      const result = Task.validateParent({ parent });
      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }
      if (parent) {
        const taskParent = await Task.findByPk(parent);
        if (!taskParent || !taskParent.enabled || taskParent.user !== task.user || taskParent.id === id) {
          res.status(404).json({ error: 'La tarea padre no es válida' });
          return;
        }
      }

      await task.update({ parent });

      res.status(200).json(task);
    } catch (error) {
      console.error('Error al actualizar tarea padre de tarea:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async updateDifficulty (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const taskUser = req.user.id;
      const id = parseInt(req.params.id);

      const task = await Task.findByPk(id);
      if (!task || !task.enabled) {
        res.status(404).json({ error: 'La tarea no existe' });
        return;
      }
      if (task.user !== taskUser && !req.user.admin) {
        res.status(403).json({ error: 'No tienes permisos para actualizar esta tarea' });
        return;
      }
      const difficulty = req.body.difficulty;
      const result = Task.validateDifficulty({ difficulty });
      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }

      await task.update({ difficulty });

      res.status(200).json(task);
    } catch (error) {
      console.error('Error al actualizar dificultad de tarea:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async updateLocation (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const taskUser = req.user.id;
      const id = parseInt(req.params.id);

      const task = await Task.findByPk(id);
      if (!task || !task.enabled) {
        res.status(404).json({ error: 'La tarea no existe' });
        return;
      }
      if (task.user !== taskUser && !req.user.admin) {
        res.status(403).json({ error: 'No tienes permisos para actualizar esta tarea' });
        return;
      }
      const { lat, lng } = req.body;
      const result = Task.validateLocation({ lat, lng });
      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }
      if ((typeof lat === 'number' && typeof lng !== 'number') || (typeof lat !== 'number' && typeof lng === 'number')) {
        res.status(400).json({ error: 'Ubicación de la tarea incorrecta' });
        return;
      }

      await task.update({ lat, lng });

      res.status(200).json(task);
    } catch (error) {
      console.error('Error al actualizar ubicación de tarea:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async updateList (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const taskUser = req.user.id;
      const id = parseInt(req.params.id);

      const task = await Task.findByPk(id);
      if (!task || !task.enabled) {
        res.status(404).json({ error: 'La tarea no existe' });
        return;
      }
      if (task.user !== taskUser && !req.user.admin) {
        res.status(403).json({ error: 'No tienes permisos para actualizar esta tarea' });
        return;
      }
      const list = req.body.list;
      const result = Task.validateList({ list });
      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }
      if (list) {
        const taskList = await TaskList.findByPk(list);
        if (!taskList || !taskList.enabled || taskList.user !== task.user) {
          res.status(404).json({ error: 'La lista de tareas no existe' });
          return;
        }
      }

      await task.update({ list });

      res.status(200).json(task);
    } catch (error) {
      console.error('Error al actualizar lista de tareas de tarea:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async updateFavourite (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const taskUser = req.user.id;
      const id = parseInt(req.params.id);

      const task = await Task.findByPk(id);
      if (!task || !task.enabled) {
        res.status(404).json({ error: 'La tarea no existe' });
        return;
      }
      if (task.user !== taskUser && !req.user.admin) {
        res.status(403).json({ error: 'No tienes permisos para actualizar esta tarea' });
        return;
      }
      const favourite = req.body.favourite;
      const result = Task.validateFavourite({ favourite });
      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }

      await task.update({ favourite });

      res.status(200).json(task);
    } catch (error) {
      console.error('Error al actualizar el favorito de tarea:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async updateDone (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const taskUser = req.user.id;
      const id = parseInt(req.params.id);

      const task = await Task.findByPk(id);
      if (!task || !task.enabled) {
        res.status(404).json({ error: 'La tarea no existe' });
        return;
      }
      if (task.user !== taskUser && !req.user.admin) {
        res.status(403).json({ error: 'No tienes permisos para actualizar esta tarea' });
        return;
      }
      const done = req.body.done;
      const result = Task.validateDone({ done });
      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }

      await task.update({ done });

      res.status(200).json(task);
    } catch (error) {
      console.error('Error al actualizar el completado de tarea:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async disable (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const taskUser = req.user.id;
      const id = parseInt(req.params.id);

      const task = await Task.findByPk(id);
      if (!task || !task.enabled) {
        res.status(404).json({ error: 'La tarea no existe' });
        return;
      }
      if (task.user !== taskUser && !req.user.admin) {
        res.status(403).json({ error: 'No tienes permisos para deshabilitar esta tarea' });
        return;
      }

      await task.update({ enabled: false });

      res.status(200).json({ message: 'La tarea ha sido deshabilitada correctamente', task });
    } catch (error) {
      console.error('Error al deshabilitar tarea:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }
}

const taskController = new TaskController();
export default taskController;
