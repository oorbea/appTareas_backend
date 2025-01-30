import { DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';

export const TaskList = sequelize.define('TaskList', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED.ZEROFILL,
    primaryKey: true,
    autoIncrement: true
  },
  user: {
    type: DataTypes.INTEGER.UNSIGNED.ZEROFILL,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(30),
    allowNull: false
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
      fields: ['user', 'name']
    }
  ]
});
