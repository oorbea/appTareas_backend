import { Model, DataTypes, Optional } from 'sequelize';
import db from '../db';

interface TaskAttributes {
  id: number;
  user: number;
  title: string;
  details?: string | null;
  deadline?: Date | null;
  parent?: number | null;
  difficulty: number;
  lat?: number | null;
  lng?: number | null;
  list?: number | null;
  favourite: boolean;
  done: boolean;
  enabled: boolean;
}

class Task extends Model<TaskAttributes, Optional<TaskAttributes, 'id' | 'details' | 'deadline' | 'parent' | 'difficulty' | 'lat' | 'lng' | 'list' | 'favourite' | 'done' | 'enabled'>> implements TaskAttributes {
  public id!: number;
  public user!: number;
  public title!: string;
  public details!: string | null;
  public deadline!: Date | null;
  public parent!: number | null;
  public difficulty!: number;
  public lat!: number | null;
  public lng!: number | null;
  public list!: number | null;
  public favourite!: boolean;
  public done!: boolean;
  public enabled!: boolean;
}

Task.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED.ZEROFILL,
    primaryKey: true,
    autoIncrement: true
  },
  user: {
    type: DataTypes.INTEGER.UNSIGNED.ZEROFILL,
    allowNull: false,
    references: {
      model: 'users',
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
      model: 'tasks',
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
      notNullIfLng (value: number | null): void {
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
      notNullIfLat (value: number | null): void {
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
      model: 'taskLists',
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
}, {
  sequelize: db.getSequelize(),
  modelName: 'task'
});

export default Task;
