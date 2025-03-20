import NotificationSender from './notificationSender';
import { CustomWebSocket } from '../../../types/CustomWebSocket';
import Notification, { NotificationStatus } from '../../models/notification';
import { WebSocketServer } from 'ws';

class SocketNotificationSender implements NotificationSender {
  name: string;
  protected wss: WebSocketServer;
  constructor (wss: WebSocketServer, name = 'SocketNotificationSender') {
    this.name = name;
    this.wss = wss;
  }

  public async sendNotification (notification: Notification): Promise<void> {
    try {
      const { user, message, type, task } = notification;

      const client = Array.from(this.wss.clients as Set<CustomWebSocket>).find(
        (client) => client.user?.id === user
      );

      if (client) {
        client.send(JSON.stringify({
          type: 'notification',
          notification: {
            id: notification.id,
            scheduledTime: notification.scheduledTime,
            task,
            message,
            type
          }
        }));
        await notification.update({ status: NotificationStatus.SENT });
      } else {
        console.error('Cliente no encontrado');
        await notification.update({ status: NotificationStatus.FAILED });
      }
    } catch (error) {
      console.error('Error al enviar notificación por socket:', error);
      await notification.update({ status: NotificationStatus.FAILED });
    }
  }

  public async sendBatch (notifications: Notification[]): Promise<void> {
    try {
      const userId = notifications[0]?.user;
      const client = Array.from(this.wss.clients as Set<CustomWebSocket>).find(
        (ws) => ws.user?.id === userId
      );

      if (client) {
        client.send(JSON.stringify({
          type: 'batch-notification',
          notifications: notifications.map(n => ({
            id: n.id,
            scheduledTime: n.scheduledTime,
            task: n.task,
            message: n.message,
            type: n.type
          }))
        }));

        await Promise.all(
          notifications.map(n => n.update({ status: NotificationStatus.SENT }))
        );
      } else {
        await Promise.all(
          notifications.map(n => n.update({ status: NotificationStatus.FAILED }))
        );
      }
    } catch (error) {
      console.error('Error en batch WebSocket:', error);
      await Promise.all(
        notifications.map(n => n.update({ status: NotificationStatus.FAILED }))
      );
    }
  }
}

export default SocketNotificationSender;
