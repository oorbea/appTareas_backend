import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());
