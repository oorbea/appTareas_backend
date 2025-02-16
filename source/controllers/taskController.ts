import { Request, Response } from 'express';
import dotenv from 'dotenv';
import Task from '../models/task';
import TaskList from '../models/taskList';
import Validation from '../validations';

dotenv.config();

class TaskController {
  public async createPublic (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const result = Validation.validateTask(req.body);
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
      const result1 = Validation.validateTask(req.body);
      if (result1.error) {
        res.status(400).json({ error: result1.error.issues[0].message });
        return;
      }

      const user = parseInt(req.params.user);
      if (!user) {
        res.status(400).json({ error: 'El usuario es requerido' });
        return;
      }
      const result2 = Validation.validateTaskUser({ user });
      if (result2.error) {
        res.status(400).json({ error: result2.error.issues[0].message });
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
}

const taskController = new TaskController();
export default taskController;
