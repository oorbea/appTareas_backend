import { Request, Response } from 'express';
import dotenv from 'dotenv';
import Notification, { NotificationQuery } from '../models/notification';
import Task from '../models/task';

dotenv.config();

class NotificationController {
  public async createPublic (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    try {
      const result = Notification.validate(req.body);
      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }
      const { when, task } = req.body;
      const existingTask = await Task.findByPk(task);
      if (!existingTask || !existingTask.enabled || existingTask.user !== req.user.id) {
        res.status(404).json({ error: 'La tarea no existe o está deshabilitada' });
        return;
      }
      const existingNotification = await Notification.findOne({ where: { when, task } });
      if (existingNotification) {
        if (existingNotification.enabled) {
          res.status(409).json({ error: 'Ya existe una notificación para esta tarea en esta fecha y hora' });
          return;
        }
        await existingNotification.update({ enabled: true });
        res.status(201).json({
          message: 'Notificación creada exitosamente',
          notification: {
            id: existingNotification.id,
            when: existingNotification.when,
            task: existingNotification.task,
            enabled: existingNotification.enabled
          }
        });
        return;
      }
      const notification = await Notification.create({ when, task, enabled: true });
      res.status(201).json({
        message: 'Notificación creada exitosamente',
        notification: {
          id: notification.id,
          when: notification.when,
          task: notification.task,
          enabled: notification.enabled
        }
      });
    } catch (error) {
      console.error('Error al crear notificación: ', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async createAdmin (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    if (!req.user.admin) {
      res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    try {
      const result = Notification.validateWhen(req.body);
      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }
      const when = req.body.when;
      const task = parseInt(req.params.task);
      const existingTask = await Task.findByPk(task);
      if (!existingTask || !existingTask.enabled) {
        res.status(404).json({ error: 'La tarea no existe o está deshabilitada' });
        return;
      }
      const existingNotification = await Notification.findOne({ where: { when, task } });
      if (existingNotification) {
        if (existingNotification.enabled) {
          res.status(409).json({ error: 'Ya existe una notificación para esta tarea en esta fecha y hora' });
          return;
        }
        await existingNotification.update({ enabled: true });
        res.status(201).json({
          message: 'Notificación creada exitosamente',
          notification: {
            id: existingNotification.id,
            when: existingNotification.when,
            task: existingNotification.task,
            enabled: existingNotification.enabled
          }
        });
        return;
      }
      const notification = await Notification.create({ when, task, enabled: true });
      res.status(201).json({
        message: 'Notificación creada exitosamente',
        notification: {
          id: notification.id,
          when: notification.when,
          task: notification.task,
          enabled: notification.enabled
        }
      });
    } catch (error) {
      console.error('Error al crear notificación: ', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async getMine (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    try {
      const query: NotificationQuery = {
        enabled: true,
        ...req.query
      };
      if (query.id) {
        query.id = parseInt(query.id as unknown as string);
        const notification = await Notification.findByPk(query.id);
        const tasks = await Task.findAll({ where: { user: req.user.id, enabled: true } });
        const taskIds = tasks.map(task => task.id);
        if (!notification || !notification.enabled || !taskIds.find(id => id === notification.task)) {
          res.status(404).json({ error: 'La notificación no existe o está deshabilitada' });
          return;
        }
        res.status(200).json(notification);
        return;
      }
      let tasks: Task[] = [];
      if (query.task) {
        query.task = parseInt(query.task as unknown as string);
        const t = await Task.findByPk(query.task);
        if (!t || !t.enabled || t.user !== req.user.id) {
          res.status(404).json({ error: 'La tarea no existe o está deshabilitada' });
          return;
        }
        tasks.push(t);
      } else {
        tasks = await Task.findAll({ where: { user: req.user.id, enabled: true } });
      }
      const taskIds = tasks.map(task => task.id);
      let notifications: Notification[] = [];
      if (query.when) {
        for (const id of taskIds) {
          const notis = await Notification.findAll({ where: { task: id, when: query.when, enabled: true } });
          notifications = notifications.concat(notis);
        }
      } else {
        for (const id of taskIds) {
          const notis = await Notification.findAll({ where: { task: id, enabled: true } });
          notifications = notifications.concat(notis);
        }
      }
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error al obtener notificaciones: ', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }
}

const notificationController = new NotificationController();
export default notificationController;
