import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config({ path: '../.env' });

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ?? 5000;
const BASE_URL = `http://localhost:${PORT}`;

app.use((req, res) => {
  res.status(404).send('<h1>404 - Página no encontrada</h1>');
});

app.listen(PORT, () => {
  console.log('Server is running on ' + BASE_URL);
});
