import { Model, DataTypes, Optional } from 'sequelize';
import db from '../db';
import { notificationSchema, notificationWhenSchema, notificationTaskSchema } from '../schemas/notificationSchema';

export interface NotificationQuery {
  id?: number;
  when?: Date;
  task?: number;
  enabled?: boolean;
}

interface NotificationAttributes {
  id: number;
  when: Date;
  task: number;
  enabled: boolean;
}

class Notification extends Model<NotificationAttributes, Optional<NotificationAttributes, 'id' | 'enabled'>> implements NotificationAttributes {
  public id!: number;
  public when!: Date;
  public task!: number;
  public enabled!: boolean;

  public static validate (notification: object) {
    return notificationSchema.safeParse(notification);
  }

  public static validateWhen (when: object) {
    return notificationWhenSchema.safeParse(when);
  }

  public static validateTask (task: object) {
    return notificationTaskSchema.safeParse(task);
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
  when: {
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
      fields: ['when', 'task']
    }
  ]
});

export default Notification;
