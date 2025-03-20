import NotificationSender from './notificationSender';
import Notification, { NotificationStatus } from '../../models/notification';

export interface Senders {
  [key: string]: NotificationSender;
}

export default class NotificationService {
  #senders: Senders;
  #batchWindowMinutes: number;

  constructor (senders: NotificationSender[], batchWindowMinutes = 5) {
    this.#batchWindowMinutes = batchWindowMinutes;
    this.#senders = {};
    senders.forEach(sender => {
      this.addSender(sender);
    });
  }

  public addSender (sender: NotificationSender) {
    this.#senders[sender.name] = sender;
  }

  public async send (notification: Notification) {
    for (const sender in this.#senders) {
      await this.#senders[sender].sendNotification(notification);
    }
  }

  #groupNotifications (notifications: Notification[], batchMinutes = this.#batchWindowMinutes): Map<string, Notification[]> {
    const grouped = new Map<string, Notification[]>();

    for (const notification of notifications) {
      const timestamp = notification.scheduledTime.getTime();
      const windowStart = Math.floor(timestamp / (batchMinutes * 60 * 1000));

      const key = `${notification.user}-${windowStart}`;

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)?.push(notification);
    }

    return grouped;
  }

  public async sendBatch (notifications: Notification[]): Promise<void> {
    try {
      const grouped = this.#groupNotifications(notifications);
      console.log(`Procesando ${grouped.size} lotes de notificaciones`);

      for (const [batchKey, batch] of grouped) {
        const [userId, windowStart] = batchKey.split('-');
        console.log(`Enviando lote para usuario ${userId} en ventana ${new Date(parseInt(windowStart))}`);

        for (const sender in this.#senders) {
          try {
            await this.#senders[sender].sendBatch(batch);
          } catch (error) {
            console.error(`Error con ${this.#senders[sender].name} en lote ${batchKey}:`, error);
            await this.#fallbackToSingleSend(batch, this.#senders[sender]);
          }
        }
      }
    } catch (error) {
      console.error('Error crítico en sendBatch:', error);
      throw error;
    }
  }

  // Fallback para envío individual si falla el batch
  async #fallbackToSingleSend (
    notifications: Notification[],
    sender: NotificationSender
  ): Promise<void> {
    console.warn(`Intentando envío individual con ${sender.name}...`);

    for (const notification of notifications) {
      try {
        await sender.sendNotification(notification);
      } catch (e) {
        console.error(`Error en fallback para notificación ${notification.id}:`, e);
        await notification.update({ status: NotificationStatus.FAILED });
      }
    }
  }
}
