import Notification from '../../models/notification';

interface NotificationSender {
  name: string
  sendNotification(notification: Notification): Promise<void>;
}

export default NotificationSender;
