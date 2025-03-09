import { Sequelize, Dialect } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbPassword = process.env.DB_PASSWORD as string;
const dbHost = process.env.DB_HOST as string;

abstract class Database {
  protected sequelize: Sequelize;
  constructor (name: string, user: string, password: string, host: string | undefined, dialect: Dialect | undefined) {
    this.sequelize = new Sequelize(name, user, password, {
      host,
      dialect
    });
  }

  abstract connectDB (): Promise<void>;
  abstract createTables (): Promise<Sequelize>;
  abstract dropTables (): Promise<unknown[]>;
  abstract getSequelize (): Sequelize;
}

class MySQLDatabase extends Database {
  constructor (name: string, user: string, password: string, host: string | undefined) {
    super(name, user, password, host, 'mysql');
  }

  public async connectDB () {
    try {
      this.sequelize.authenticate();
      console.log('Connection to database has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  }

  public async dropWrongTables () {
    await this.sequelize.getQueryInterface().dropTable('Notifications');
    await this.sequelize.getQueryInterface().dropTable('Tasks');
    await this.sequelize.getQueryInterface().dropTable('TaskLists');
    await this.sequelize.getQueryInterface().dropTable('Users');
  }

  public async createTables () {
    return this.sequelize.sync({ alter: true });
  }

  public async dropTables () {
    return this.sequelize.drop();
  }

  public getSequelize () {
    return this.sequelize;
  }
}

const mysqlDB = new MySQLDatabase(dbName, dbUser, dbPassword, dbHost);
export default mysqlDB;
