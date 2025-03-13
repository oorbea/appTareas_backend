import Notification from '../../models/notification';

interface NotificationSender {
  sendNotification(notification: Notification): Promise<void>;
}

export default NotificationSender;
