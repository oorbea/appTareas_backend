import NotificationSender from './notificationSender';
import Notification from '../../models/notification';

class NotificationService {
  senders: NotificationSender[];

  constructor (senders: NotificationSender[]) {
    this.senders = senders;
  }

  public async send (notification: Notification) {
    for (const sender of this.senders) {
      await sender.sendNotification(notification);
    }
  }
}
