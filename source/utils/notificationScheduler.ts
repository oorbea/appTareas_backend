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
  #batchWindowMinutes: number;

  constructor (
    socketController: SocketController,
    fcmController: FcmController,
    batchWindowMinutes = 5
  ) {
    const socketSender = new SocketNotificationSender(socketController.wss);
    const fcmSender = new FcmNotificationSender(fcmController.admin);

    this.#notificationService = new NotificationService([socketSender, fcmSender], 5);
    this.#batchWindowMinutes = batchWindowMinutes;
  }

  public start (): void {
    cron.schedule('* * * * *', async () => {
      try {
        const now = new Date();
        console.log(`[${now.toISOString()}] Iniciando ciclo de notificaciones...`);

        const pendingNotifications = await Notification.findAll({
          where: {
            scheduledTime: {
              [Op.lte]: now,
              [Op.gte]: new Date(now.getTime() - this.#batchWindowMinutes * 60 * 1000)
            },
            status: NotificationStatus.PENDING,
            enabled: true
          },
          order: [['scheduledTime', 'ASC']]
        });

        if (pendingNotifications.length > 0) {
          console.log(`📦 Notificaciones a procesar: ${pendingNotifications.length}`);
          console.log(`⏳ Ventana temporal: ${this.#batchWindowMinutes} minutos`);

          await this.#notificationService.sendBatch(pendingNotifications);

          console.log('✅ Proceso batch completado');
        } else {
          console.log('🔄 No hay notificaciones pendientes en esta ventana');
        }

        await this.#cleanupFailedNotifications();
      } catch (error) {
        console.error('Error crítico en el scheduler:', error);
      }
    });
  }

  async #cleanupFailedNotifications (retentionDays: number = 7): Promise<void> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - retentionDays);

    await Notification.destroy({
      where: {
        status: NotificationStatus.FAILED,
        scheduledTime: { [Op.lt]: thresholdDate }
      }
    });
  }
}
