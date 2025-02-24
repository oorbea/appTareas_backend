import { Request, Response } from 'express';
import TaskList from '../models/taskList';
import User from '../models/user';
import dotenv from 'dotenv';

dotenv.config();

class TaskListController {
  public async createPublic (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const user = req.user.id;
      const { name } = req.body;
      const result = TaskList.validateName({ name });
      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }
      let taskList = await TaskList.findOne({ where: { name, user } });
      if (taskList) {
        if (taskList.enabled) {
          res.status(409).json({ error: 'Ya existe una lista de tareas con ese nombre' });
          return;
        }

        await taskList.update({ enabled: true });
      } else taskList = await TaskList.create({ name, user });

      res.status(201).json({
        message: 'Lista de tareas creada exitosamente',
        taskList: { id: taskList.id, name: taskList.name, user: taskList.user }
      });
    } catch (error) {
      console.error('Error al crear lista de tareas:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async createAdmin (req: Request, res: Response): Promise<void> {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    const user = parseInt(req.params.user);

    const { name } = req.body;
    const result = TaskList.validateName({ name });
    if (result.error) {
      res.status(400).json({ error: result.error.issues[0].message });
      return;
    }
    try {
      let taskList = await TaskList.findOne({ where: { name, user } });
      if (taskList) {
        if (taskList.enabled) {
          res.status(409).json({ error: 'Ya existe una lista de tareas con ese nombre' });
          return;
        }
        await taskList.update({ enabled: true });
      } else taskList = await TaskList.create({ name, user });

      res.status(201).json({
        message: 'Lista de tareas creada exitosamente',
        taskList: { id: taskList.id, name: taskList.name, user: taskList.user }
      });
    } catch (error) {
      console.error('Error al crear lista de tareas:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async getAll (req: Request, res: Response): Promise<void> {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    try {
      const taskLists = await TaskList.findAll({
        attributes: ['id', 'name', 'user'],
        where: { enabled: true }
      });
      res.status(200).json(taskLists);
    } catch (error) {
      console.error('Error al obtener listas de tareas:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async getByUser (req: Request, res: Response): Promise<void> {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    const user = parseInt(req.params.user);

    try {
      const taskLists = await TaskList.findAll({
        attributes: ['id', 'name', 'user'],
        where: { user, enabled: true }
      });
      res.status(200).json(taskLists);
    } catch (error) {
      console.error('Error al obtener listas de tareas:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async getById (req: Request, res: Response): Promise<void> {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    const id = parseInt(req.params.id);

    try {
      const taskList = await TaskList.findByPk(id);

      if (!taskList || !taskList.enabled) {
        res.status(404).json({ error: 'Lista de tareas no encontrada' });
        return;
      }

      res.status(200).json({
        id: taskList.id,
        name: taskList.name,
        user: taskList.user
      });
    } catch (error) {
      console.error('Error al obtener listas de tareas:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async getMine (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const user: number = req.user.id;
      const taskLists = await TaskList.findAll({
        attributes: ['id', 'name', 'user'],
        where: { user, enabled: true }
      });
      res.status(200).json(taskLists);
    } catch (error) {
      console.error('Error al obtener listas de tareas:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async getByName (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const user: number = req.user.id;
      const { name } = req.params;

      const taskList = await TaskList.findOne({
        attributes: ['id', 'name', 'user'],
        where: { user, name, enabled: true }
      });
      if (!taskList) {
        res.status(404).json({ error: 'Lista de tareas no encontrada' });
        return;
      }
      res.status(200).json(taskList);
    } catch (error) {
      console.error('Error al obtener listas de tareas:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async disable (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const id = parseInt(req.params.id);
      const taskList = await TaskList.findByPk(id);

      if (!taskList || !taskList.enabled) {
        res.status(404).json({ error: 'Lista de tareas no encontrada' });
        return;
      }

      if (taskList.user !== req.user.id && !req.user.admin) {
        res.status(403).json({ error: 'No tienes permisos para deshabilitar esta lista' });
        return;
      }
      await taskList.disable();
      res.status(200).json({
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
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async disableByName (req: Request, res: Response): Promise<void> {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const name = req.params.name;
      const taskList = await TaskList.findOne({ where: { name, user: user.id } });

      if (!taskList || !taskList.enabled) {
        res.status(404).json({ error: 'Lista de tareas no encontrada' });
        return;
      }

      await taskList.disable();
      res.status(200).json({
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
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async updateName (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }

    try {
      const id = parseInt(req.params.id);
      const user = req.user.id;
      const { name } = req.body;

      const result = TaskList.validateName({ name });
      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }

      const taskList = await TaskList.findByPk(id);
      if (!taskList || !taskList.enabled) {
        res.status(404).json({ error: 'Lista de tareas no encontrada' });
        return;
      }

      const existingTaskList = await TaskList.findOne({ where: { name, user: taskList.user, enabled: true } });
      if (existingTaskList) {
        res.status(409).json({ error: 'Ya existe una lista de tareas con ese nombre' });
        return;
      }

      if (taskList.user !== user && !req.user.admin) {
        res.status(403).json({ error: 'No tienes permisos para cambiar el nombre de esta lista' });
        return;
      }

      await taskList.update({ name });
      res.status(200).json({
        message: 'Nombre de la lista de tareas actualizado correctamente',
        taskList: {
          id: taskList.id,
          name: taskList.name,
          user: taskList.user
        }
      });
    } catch (error) {
      console.error('Error al cambiar el nombre a lista de tareas:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async update (req: Request, res: Response): Promise<void> {
    if (!req.user || !req.user.admin) {
      res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    try {
      const id = parseInt(req.params.id);

      const result = TaskList.validate(req.body);
      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }
      const { name, user, enabled } = req.body;
      const taskList = await TaskList.findByPk(id);
      if (!taskList || !taskList.enabled) {
        res.status(404).json({ error: 'Lista de tareas no encontrada' });
        return;
      }

      const existingUser = await User.findByPk(user);
      if (!existingUser) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const existingTaskList = await TaskList.findOne({ where: { name, user, enabled: true } });
      if (existingTaskList && existingTaskList.id !== id) {
        res.status(409).json({ error: 'Ya existe una lista de tareas con ese nombre' });
        return;
      }
      await taskList.update({
        name: name ?? taskList.name,
        user: user ?? taskList.user,
        enabled: enabled ?? taskList.enabled
      });

      res.status(200).json({
        message: 'Lista de tareas actualizada correctamente',
        taskList: {
          name: taskList.name,
          user: taskList.user,
          enabled: taskList.enabled
        }
      });
    } catch (error) {
      console.error('Error al actualizar lista de tareas:', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }
}

const taskListController = new TaskListController();
export default taskListController;
