import { DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';

export const Task = sequelize.define('Task', {
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
  title: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  parent: {
    type: DataTypes.INTEGER.UNSIGNED.ZEROFILL,
    allowNull: true,
    references: {
      model: 'Tasks',
      key: 'id'
    }
  },
  difficulty: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    },
    defaultValue: 1
  },
  lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    validate: {
      notNullIfLng (value) {
        if (value !== null && this.lng === null) {
          throw new Error('La longitud no puede ser nula si la latitud no es nula');
        }
      }
    }
  },
  lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    validate: {
      notNullIfLat (value) {
        if (value !== null && this.lat === null) {
          throw new Error('La latitud no puede ser nula si la longitud no es nula');
        }
      }
    }
  },
  list: {
    type: DataTypes.INTEGER.UNSIGNED.ZEROFILL,
    allowNull: true,
    references: {
      model: 'TaskLists',
      key: 'id'
    }
  },
  favourite: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  done: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
});
