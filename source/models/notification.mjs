import { DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';

export const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED.ZEROFILL,
    primaryKey: true,
    autoIncrement: true
  },
  when: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfter: new Date().toISOString()
    }
  },
  task: {
    type: DataTypes.INTEGER.UNSIGNED.ZEROFILL,
    allowNull: false,
    references: {
      model: 'Task',
      key: 'id'
    }
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['when', 'task']
    }
  ]
});
