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
      model: 'Users',
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

export async function createFavouriteList (user) {
  try {
    await TaskList.findOrCreate({
      where: {
        user: user.id,
        name: 'prioritease-favourite-tasks',
        enabled: true
      },
      defaults: {
        user: user.id,
        name: 'prioritease-favourite-tasks',
        enabled: true
      }
    });
    console.log(`Lista de tareas "prioritease-favourite-tasks" creada para el usuario ${user.id}`);
  } catch (error) {
    console.error('Error al crear la lista de tareas por defecto:', error);
  }
}
