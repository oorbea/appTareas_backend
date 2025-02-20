import { Model, DataTypes, Optional } from 'sequelize';
import db from '../db';
import { taskDetailsSchema, taskSchema, taskTitleSchema, taskUserSchema, taskDeadlineSchema, taskParentSchema, taskDifficultySchema, taskLocationSchema, taskListSchema, taskFavouriteSchema, taskDoneSchema } from '../schemas/taskSchema';

export interface TaskQuery {
  user?: number | null;
  title?: string;
  details?: string | null;
  deadline?: Date | null;
  parent?: number | null;
  difficulty?: number;
  lat?: number | null;
  lng?: number | null;
  list?: number | null;
  favourite?: boolean;
  done?: boolean;
  enabled?: boolean;
}

export interface TaskAttributes {
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

  public static validate (task: object) {
    return taskSchema.safeParse(task);
  }

  public static validateUser (user: object) {
    return taskUserSchema.safeParse(user);
  }

  public static validateTitle (title: object) {
    return taskTitleSchema.safeParse(title);
  }

  public static validateDetails (details: object) {
    return taskDetailsSchema.safeParse(details);
  }

  public static validateDeadline (deadline: object) {
    return taskDeadlineSchema.safeParse(deadline);
  }

  public static validateParent (parent: object) {
    return taskParentSchema.safeParse(parent);
  }

  public static validateDifficulty (difficulty: object) {
    return taskDifficultySchema.safeParse(difficulty);
  }

  public static validateLocation (location: object) {
    return taskLocationSchema.safeParse(location);
  }

  public static validateList (list: object) {
    return taskListSchema.safeParse(list);
  }

  public static validateFavourite (favourite: object) {
    return taskFavouriteSchema.safeParse(favourite);
  }

  public static validateDone (done: object) {
    return taskDoneSchema.safeParse(done);
  }
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
    allowNull: true
  },
  lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
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
