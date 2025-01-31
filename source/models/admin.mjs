import { DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';
import bcrypt from 'bcryptjs';

export const Admin = sequelize.define('Admin', {
  username: {
    type: DataTypes.STRING(30),
    primaryKey: true
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  hooks: {
    beforeCreate: async (admin) => {
      if (admin.password) {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(admin.password, salt);
      }
    },
    beforeUpdate: async (admin) => {
      if (admin.password) {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(admin.password, salt);
      }
    }
  }
});

export function createAdmin () {
  Admin.findOrCreate({
    where: { username: process.env.ADMIN_USERNAME },
    defaults: { password: process.env.ADMIN_PASSWORD }
  })
    .then(() => {
      console.log('Admin created successfully');
    })
    .catch((error) => {
      console.error('Error creating admin:', error);
    });
}
