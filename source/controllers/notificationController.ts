import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { WhereOptions } from 'sequelize';
import Notification, { NotificationQuery, NotificationAttributes, NotificationStatus, NotificationType } from '../models/notification';
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
      const { scheduledTime, task, message, type } = req.body;
      const user = req.user.id;
      const existingTask = await Task.findByPk(task);
      if (!existingTask || !existingTask.enabled || existingTask.user !== user) {
        res.status(404).json({ error: 'La tarea no existe o está deshabilitada' });
        return;
      }
      const existingNotification = await Notification.findOne({ where: { scheduledTime, task } });
      if (existingNotification) {
        if (existingNotification.enabled) {
          res.status(409).json({ error: 'Ya existe una notificación para esta tarea en esta fecha y hora' });
          return;
        }
        await existingNotification.update({ enabled: true, message, type: type ?? existingNotification.type });
        res.status(201).json({
          message: 'Notificación creada exitosamente',
          notification: {
            id: existingNotification.id,
            scheduledTime: existingNotification.scheduledTime,
            task: existingNotification.task,
            user: existingNotification.user,
            status: existingNotification.status,
            message: existingNotification.message,
            type: existingNotification.type,
            enabled: existingNotification.enabled
          }
        });
        return;
      }
      const notification = await Notification.create({ scheduledTime, task, user, status: NotificationStatus.PENDING, message, type: type ?? NotificationType.REMINDER, enabled: true });
      res.status(201).json({
        message: 'Notificación creada exitosamente',
        notification: {
          id: notification.id,
          scheduledTime: notification.scheduledTime,
          task: notification.task,
          user: notification.user,
          status: notification.status,
          message: notification.message,
          type: notification.type,
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
      const result = Notification.validate(req.body);
      if (result.error) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }
      const { scheduledTime, task, message, type } = req.body;
      const user = parseInt(req.params.user);
      const existingTask = await Task.findByPk(task);
      if (!existingTask || !existingTask.enabled || existingTask.user !== user) {
        res.status(404).json({ error: 'La tarea no existe o está deshabilitada' });
        return;
      }
      const existingNotification = await Notification.findOne({ where: { scheduledTime, task } });
      if (existingNotification) {
        if (existingNotification.enabled) {
          res.status(409).json({ error: 'Ya existe una notificación para esta tarea en esta fecha y hora' });
          return;
        }
        await existingNotification.update({ enabled: true, message, type: type ?? existingNotification.type });
        res.status(201).json({
          message: 'Notificación creada exitosamente',
          notification: {
            id: existingNotification.id,
            scheduledTime: existingNotification.scheduledTime,
            task: existingNotification.task,
            user: existingNotification.user,
            status: existingNotification.status,
            message: existingNotification.message,
            type: existingNotification.type,
            enabled: existingNotification.enabled
          }
        });
        return;
      }
      const notification = await Notification.create({ scheduledTime, task, user: existingTask.user, status: NotificationStatus.PENDING, message, type: type ?? NotificationType.REMINDER, enabled: true });
      res.status(201).json({
        message: 'Notificación creada exitosamente',
        notification: {
          id: notification.id,
          scheduledTime: notification.scheduledTime,
          task: notification.task,
          user: notification.user,
          status: notification.status,
          message: notification.message,
          type: notification.type,
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
        user: req.user.id,
        ...req.query
      };
      if (query.id) {
        query.id = parseInt(query.id as unknown as string);
        const notification = await Notification.findByPk(query.id);
        if (!notification || !notification.enabled || notification.user !== query.user) {
          res.status(404).json({ error: 'La notificación no existe o está deshabilitada' });
          return;
        }
        const notifications = [{
          id: notification.id,
          scheduledTime: notification.scheduledTime,
          task: notification.task,
          user: notification.user,
          status: notification.status,
          message: notification.message,
          type: notification.type,
          enabled: notification.enabled
        }];
        res.status(200).json(notifications);
        return;
      }
      const notifications = await Notification.findAll({ where: query as WhereOptions<NotificationAttributes> });

      res.status(200).json(notifications.map(notification => ({
        id: notification.id,
        scheduledTime: notification.scheduledTime,
        task: notification.task,
        user: notification.user,
        status: notification.status,
        message: notification.message,
        type: notification.type,
        enabled: notification.enabled
      })));
    } catch (error) {
      console.error('Error al obtener notificaciones: ', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }

  public async getAll (req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No tienes permisos para acceder a esta ruta' });
      return;
    }
    if (!req.user.admin) {
      res.status(403).json({ error: 'No tienes permisos para acceder a esta ruta' });
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
        if (!notification || !notification.enabled) {
          res.status(404).json({ error: 'La notificación no existe o está deshabilitada' });
          return;
        }
        const notifications = [{
          id: notification.id,
          scheduledTime: notification.scheduledTime,
          task: notification.task,
          user: notification.user,
          status: notification.status,
          message: notification.message,
          type: notification.type,
          enabled: notification.enabled
        }];
        res.status(200).json(notifications);
        return;
      }
      const notifications = await Notification.findAll({ where: query as WhereOptions<NotificationAttributes> });

      res.status(200).json(notifications.map(notification => ({
        id: notification.id,
        scheduledTime: notification.scheduledTime,
        task: notification.task,
        user: notification.user,
        status: notification.status,
        message: notification.message,
        type: notification.type,
        enabled: notification.enabled
      })));
    } catch (error) {
      console.error('Error al obtener notificaciones: ', error);
      res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
    }
  }
}

const notificationController = new NotificationController();
export default notificationController;
