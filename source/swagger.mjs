import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { userSchemaSwagger } from './schemas/userSchema.mjs';
import { taskListSchemaSwagger } from './schemas/taskListSchema.mjs';
import { taskSchemaSwagger } from './schemas/taskSchema.mjs';

dotenv.config();

const PORT = process.env.PORT ?? 5000;
const BASE_URL = `http://localhost:${PORT}`;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PrioritEase API',
      version: '1.0.0',
      description: 'Documentación de la API de PrioritEase'
    },
    servers: [
      {
        url: BASE_URL,
        description: 'Servidor local'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          ...userSchemaSwagger,
          example: {
            username: 'Batman',
            email: 'bruce.wayne@example.com',
            password: 'IamBatman123!'
          }
        },
        TaskList: {
          ...taskListSchemaSwagger,
          example: {
            name: 'Tareas del hogar',
            user: 1234567890,
            enabled: true
          }
        },
        Task: {
          ...taskSchemaSwagger,
          example: {
            title: 'Comprar leche',
            details: 'La leche debería ser desnatada',
            deadline: '2021-12-31',
            parent: 1234567890,
            difficulty: 2,
            lat: 40.416775,
            lng: -3.703790,
            list: 1234567890,
            favourite: false,
            done: false
          }
        }
      }
    }
  },
  apis: ['./source/routes/*.mjs']
};

const swaggerSpec = swaggerJsdoc(options);

console.log('Especificación de Swagger:', swaggerSpec);

const setupSwagger = app => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export { setupSwagger };
