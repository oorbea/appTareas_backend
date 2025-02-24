import { Model, DataTypes, Optional } from 'sequelize';
import db from '../db';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { userSchema, usernameSchema, passwordSchema, emailSchema } from '../schemas/userSchema';
import TaskList from './taskList';
import Task from './task';
import Notification from './notification';

dotenv.config();

export interface UserPayload {
  id: number;
  username: string;
  email: string;
  admin: boolean;
  [key: string]: unknown;
}

interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  picture?: string | null;
  enabled: boolean;
  resetPasswordCode?: number | null;
  resetPasswordExpires?: Date | null;
  admin: boolean;
}

class User extends Model<UserAttributes, Optional<UserAttributes, 'id' | 'picture' | 'enabled' | 'resetPasswordCode' | 'resetPasswordExpires' | 'admin'>> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public picture!: string | null;
  public enabled!: boolean;
  public resetPasswordCode!: number | null;
  public resetPasswordExpires!: Date | null;
  public admin!: boolean;

  #ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  #ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  #ADMIN_USERNAME = process.env.ADMIN_USERNAME;

  public async comparePassword (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  public async encryptPassword (password: string): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(password, salt);
  }

  public static validate (user: object) {
    return userSchema.safeParse(user);
  }

  public static validateUsername (username: object) {
    return usernameSchema.safeParse(username);
  }

  public static validatePassword (password: object) {
    return passwordSchema.safeParse(password);
  }

  public static validateEmail (email: object) {
    return emailSchema.safeParse(email);
  }

  public async disable (): Promise<void> {
    const tasks = await Task.findAll({ where: { user: this.id, enabled: true } });
    for (const task of tasks) {
      await Notification.update({ enabled: false }, { where: { task: task.id, enabled: true } });
      await task.disable();
    }
    await TaskList.update({ enabled: false }, { where: { user: this.id, enabled: true } });
    this.enabled = false;
    await this.save();
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    picture: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    resetPasswordCode: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize: db.getSequelize(),
    modelName: 'user',
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  }
);

export default User;
