import FcmController from '../../controllers/fcmController';
import NotificationSender from './notificationSender';
import Notification, { NotificationStatus } from '../../models/notification';
import User from '../../models/user';

class FcmNotificationSender extends FcmController implements NotificationSender {
  public async sendNotification (notification: Notification): Promise<void> {
    try {
      const { user, message, type, task } = notification;
      const userRecord = await User.findByPk(user);
      if (userRecord && userRecord.fcmToken) {
        await this.admin.messaging().send({
          token: userRecord.fcmToken,
          notification: {
            title: `Notificación de ${type}`,
            body: message || 'Tienes una nueva notificación'
          },
          data: {
            notificationId: notification.id.toString(),
            taskId: task.toString(),
            type
          }
        });
        await notification.update({ status: NotificationStatus.SENT });
      } else {
        console.error('El usuario no tiene un FCM token registrado');
        await notification.update({ status: NotificationStatus.FAILED });
      }
    } catch (error) {
      console.error('Error al enviar notificación FCM:', error);
      await notification.update({ status: NotificationStatus.FAILED });
    }
  }
}

export default FcmNotificationSender;
