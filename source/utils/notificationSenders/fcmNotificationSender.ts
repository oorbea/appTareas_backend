import admin from 'firebase-admin';
import { FirebaseMessagingError } from 'firebase-admin/lib/utils/error';
import NotificationSender from './notificationSender';
import Notification, { NotificationStatus } from '../../models/notification';
import User from '../../models/user';

type adminType = typeof admin;

class FcmNotificationSender implements NotificationSender {
  public name: string;
  protected admin: adminType;

  constructor (admin: adminType, name = 'FcmNotificationSender') {
    this.name = name;
    this.admin = admin;
  }

  public async sendNotification (notification: Notification): Promise<void> {
    const { user, message, type, task } = notification;
    try {
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
      if (error instanceof FirebaseMessagingError && error.code === 'messaging/invalid-registration-token') {
        await User.update({ fcmToken: null }, { where: { id: user } });
      }
      console.error('Error al enviar notificación FCM:', error);
      await notification.update({ status: NotificationStatus.FAILED });
    }
  }
}

export default FcmNotificationSender;
