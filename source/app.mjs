import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB, createTables } from './db.mjs';
import { createAdmin } from './models/user.mjs';
import { setupSwagger } from './swagger.mjs';
import routes from './routes/index.mjs';

dotenv.config();

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ?? 5000;
const BASE_URL = `http://localhost:${PORT}`;

try {
  await connectDB();
  await createTables();
  await createAdmin();
} catch (error) {
  console.error('Error connecting to database:', error);
}

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
