import { Model, DataTypes, Optional } from 'sequelize';
import db from '../db';

interface NotificationAttributes {
  id: number;
  when: Date;
  task: number;
  user: number;
  enabled: boolean;
}

class Notification extends Model<NotificationAttributes, Optional<NotificationAttributes, 'id' | 'enabled'>> implements NotificationAttributes {
  public id!: number;
  public when!: Date;
  public task!: number;
  public user!: number;
  public enabled!: boolean;
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
  user: {
    type: DataTypes.INTEGER.UNSIGNED.ZEROFILL,
    allowNull: false,
    references: {
      model: 'users',
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
