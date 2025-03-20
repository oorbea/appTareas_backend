import cron from 'node-cron';
import { Op } from 'sequelize';
import Notification, { NotificationStatus } from '../models/notification';
import NotificationService from './notificationSenders/notificationService';
import SocketNotificationSender from './notificationSenders/socketNotificationSender';
import FcmNotificationSender from './notificationSenders/fcmNotificationSender';
import SocketController from '../controllers/socketController';
import FcmController from '../controllers/fcmController';

export default class NotificationScheduler {
  #notificationService: NotificationService;

  constructor (
    socketController: SocketController,
    fcmController: FcmController
  ) {
    const socketSender = new SocketNotificationSender(socketController.wss);
    const fcmSender = new FcmNotificationSender(fcmController.admin);

    this.#notificationService = new NotificationService(socketSender, fcmSender);
  }

  public start (): void {
    cron.schedule('* * * * *', async () => {
      try {
        const now = new Date();
        const pendingNotifications = await Notification.findAll({
          where: {
            scheduledTime: { [Op.lte]: now },
            status: NotificationStatus.PENDING,
            enabled: true
          }
        });

        console.log(`Enviando ${pendingNotifications.length} notificaciones...`);

        for (const notification of pendingNotifications) {
          await this.#notificationService.send(notification);
        }
      } catch (error) {
        console.error('Error en el scheduler:', error);
      }
    });
  }
}
