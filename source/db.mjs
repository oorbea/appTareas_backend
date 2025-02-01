import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: 'mysql'
});

export async function connectDB () {
  try {
    return sequelize.authenticate();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

export function createTables () {
  return sequelize.sync({ alter: true });
}
