import { Model, DataTypes, Optional } from 'sequelize';
import db from '../db';
import { taskListSchema, taskListNameSchema } from '../schemas/taskListSchema';

interface TaskListAttributes {
  id: number;
  user: number;
  name: string;
  enabled: boolean;
}

class TaskList extends Model<TaskListAttributes, Optional<TaskListAttributes, 'id' | 'enabled'>> implements TaskListAttributes {
  public id!: number;
  public user!: number;
  public name!: string;
  public enabled!: boolean;

  public static validate (taskList: object) {
    return taskListSchema.safeParse(taskList);
  }

  public static validateName (taskList: object) {
    return taskListNameSchema.safeParse(taskList);
  }
}

TaskList.init(
  {
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
    name: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize: db.getSequelize(),
    modelName: 'taskList',
    indexes:
      [
        {
          unique: true,
          fields: ['user', 'name']
        }
      ]
  }
);

export default TaskList;
