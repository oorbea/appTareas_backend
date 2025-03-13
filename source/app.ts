import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './db';
import setupSwagger from './swagger';
import routes from './routes/index';
import adminController from './controllers/adminController';
import SocketController from './controllers/socketController'; // TODO: Implementar

dotenv.config();

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ?? 5000;
const BASE_URL = `http://localhost:${PORT}`;

async function setUpDB () {
  try {
    await db.connectDB();
    await db.dropWrongTables();
    await db.createTables();
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}

async function buildAPI () {
  try {
    await setUpDB();
    await adminController.createFirst();

    app.use('/prioritease_api', routes);

    app.get('/', (req, res) => {
      res.send('<h1>API PrioritEase</h1>');
    });

    setupSwagger(app);

    app.use((req, res) => {
      res.status(404).send('<h1>404 - Página no encontrada</h1>');
    });

    app.listen(PORT, () => {
      console.log('Server is running on ' + BASE_URL);
    });
  } catch (error) {
    console.error('Error building API:', error);
  }
}

buildAPI();
