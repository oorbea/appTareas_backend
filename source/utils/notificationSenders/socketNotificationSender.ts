import NotificationSender from './notificationSender';
import { CustomWebSocket } from '../../../types/CustomWebSocket';
import Notification, { NotificationStatus } from '../../models/notification';
import { WebSocketServer } from 'ws';

class SocketNotificationSender implements NotificationSender {
  protected wss: WebSocketServer;
  constructor (wss: WebSocketServer) {
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
}

export default SocketNotificationSender;
