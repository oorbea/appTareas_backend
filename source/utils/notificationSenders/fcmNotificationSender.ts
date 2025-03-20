import admin from 'firebase-admin';
import NotificationSender from './notificationSender';
import Notification, { NotificationStatus } from '../../models/notification';
import User from '../../models/user';
import Encrypter from '../encrypter';

type adminType = typeof admin;

interface AdminError extends Error {
  code: string;
}

class FcmNotificationSender implements NotificationSender {
  public name: string;
  protected admin: adminType;
  protected encrypter: Encrypter;

  constructor (admin: adminType, name = 'FcmNotificationSender', encrypter: Encrypter = new Encrypter()) {
    this.name = name;
    this.admin = admin;
    this.encrypter = encrypter;
  }

  public async sendNotification (notification: Notification): Promise<void> {
    const { user, message, type, task } = notification;
    try {
      const userRecord = await User.findByPk(user);
      if (userRecord && userRecord.fcmToken) {
        const decryptedToken = this.encrypter.decrypt(userRecord.fcmToken);
        await this.admin.messaging().send({
          token: decryptedToken,
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
    } catch (e) {
      const error = e as AdminError;
      if (error.code === 'messaging/invalid-registration-token') {
        await User.update({ fcmToken: null }, { where: { id: user } });
      }
      console.error('Error al enviar notificación FCM:', error);
      await notification.update({ status: NotificationStatus.FAILED });
    }
  }

  public async sendBatch (notifications: Notification[]): Promise<void> {
    const userId = notifications[0]?.user;
    try {
      const userRecord = await User.findByPk(userId);
      if (!userRecord?.fcmToken) {
        await Promise.all(
          notifications.map(n => n.update({ status: NotificationStatus.FAILED }))
        );
        return;
      }
      const decryptedToken = this.encrypter.decrypt(userRecord.fcmToken);
      await this.admin.messaging().send({
        token: decryptedToken,
        notification: {
          title: `Tienes ${notifications.length} notificaciones nuevas`,
          body: notifications.map(n => n.message).join(', ')
        },
        data: {
          batch: JSON.stringify(
            notifications.map(n => ({
              notificationId: n.id.toString(),
              taskId: n.task.toString(),
              type: n.type
            }))
          )
        }
      });

      await Promise.all(
        notifications.map(n => n.update({ status: NotificationStatus.SENT }))
      );
    } catch (error) {
      if ((error as { code: string }).code === 'messaging/invalid-registration-token') {
        await User.update({ fcmToken: null }, { where: { id: userId } });
      }
      console.error('Error en batch FCM:', error);
      await Promise.all(
        notifications.map(n => n.update({ status: NotificationStatus.FAILED }))
      );
    }
  }
}

export default FcmNotificationSender;
