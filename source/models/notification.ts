import { Model, DataTypes, Optional } from 'sequelize';
import db from '../db';
import { notificationSchema, notificationScheduledTimeSchema, notificationTaskSchema, notificationMessageSchema, notificationTypeSchema } from '../schemas/notificationSchema';

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed'
}

export enum NotificationType {
  REMINDER = 'reminder',
  DEADLINE = 'deadline',
  RECURRING = 'recurring',
  URGENT = 'urgent',
  CUSTOM = 'custom'
}

export interface NotificationQuery {
  id?: number;
  scheduledTime?: Date;
  task?: number;
  user?: number;
  status?: NotificationStatus;
  message?: string | null;
  type?: NotificationType;
  enabled?: boolean;
}

export interface NotificationAttributes {
  id: number;
  scheduledTime: Date;
  task: number;
  user: number;
  status: NotificationStatus;
  message: string | null;
  type: NotificationType;
  enabled: boolean;
}

class Notification extends Model<NotificationAttributes, Optional<NotificationAttributes, 'id' | 'enabled'>> implements NotificationAttributes {
  public id!: number;
  public scheduledTime!: Date;
  public task!: number;
  public user!: number;
  public status!: NotificationStatus;
  public message!: string | null;
  public type!: NotificationType;
  public enabled!: boolean;

  public static validate (notification: object) {
    return notificationSchema.safeParse(notification);
  }

  public static validateScheduledTime (scheduledTime: object) {
    return notificationScheduledTimeSchema.safeParse(scheduledTime);
  }

  public static validateTask (task: object) {
    return notificationTaskSchema.safeParse(task);
  }

  public static validateMessage (message: object) {
    return notificationMessageSchema.safeParse(message);
  }

  public static validateType (type: object) {
    return notificationTypeSchema.safeParse(type);
  }

  public async disable (): Promise<void> {
    this.enabled = false;
    await this.save();
  }
}

Notification.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED.ZEROFILL,
    primaryKey: true,
    autoIncrement: true
  },
  scheduledTime: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfter: new Date(Date.now()).toISOString()
    }
  },
  task: {
    type: DataTypes.INTEGER.UNSIGNED.ZEROFILL,
    allowNull: false,
    references: {
      model: 'tasks',
      key: 'id'
    }
  },
  user: {
    type: DataTypes.INTEGER.UNSIGNED.ZEROFILL,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM(NotificationStatus.PENDING, NotificationStatus.SENT, NotificationStatus.FAILED),
    allowNull: false,
    defaultValue: NotificationStatus.PENDING
  },
  message: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM(NotificationType.REMINDER, NotificationType.DEADLINE, NotificationType.RECURRING, NotificationType.URGENT, NotificationType.CUSTOM),
    allowNull: false,
    defaultValue: NotificationType.REMINDER
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  sequelize: db.getSequelize(),
  modelName: 'notification',
  indexes: [
    {
      unique: true,
      fields: ['scheduledTime', 'task']
    }
  ]
});

export default Notification;
