import NotificationSender from './notificationSender';
import Notification from '../../models/notification';

export interface Senders {
  [key: string]: NotificationSender;
}

export default class NotificationService {
  #senders: Senders;

  constructor (...senders: NotificationSender[]) {
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
}
