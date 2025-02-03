import { DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createFavouriteList } from './taskList.mjs';

dotenv.config();

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED.ZEROFILL,
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
    type: DataTypes.INTEGER(8),
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
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

export async function createAdmin () {
  try {
    const [admin, created] = await User.findOrCreate({
      where: { email: process.env.ADMIN_EMAIL },
      defaults: {
        password: process.env.ADMIN_PASSWORD,
        admin: true,
        username: process.env.ADMIN_USERNAME,
        email: process.env.ADMIN_EMAIL
      }
    });
    if (created) await createFavouriteList(admin);
    console.log('Admin created successfully');
  } catch (error) {
    console.error('Error creating admin:', error);
  }
}
