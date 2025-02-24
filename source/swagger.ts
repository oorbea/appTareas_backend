import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { userSchemaSwagger } from './schemas/userSchema';
import { taskListSchemaSwagger } from './schemas/taskListSchema';
import { taskSchemaSwagger } from './schemas/taskSchema';
import { notificationSchemaSwagger } from './schemas/notificationSchema';

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
            user: 1234567890
          }
        },
        Task: {
          ...taskSchemaSwagger,
          example: {
            title: 'Comprar leche',
            details: 'La leche debería ser desnatada',
            deadline: '2003-05-09',
            parent: 1234567890,
            difficulty: 2,
            lat: 40.416775,
            lng: -3.703790,
            list: 1234567890,
            favourite: false,
            done: false
          }
        },
        Notification: {
          ...notificationSchemaSwagger,
          example: {
            when: '2003-05-09T11:00:00.000Z',
            task: 1234567890
          }
        }
      }
    }
  },
  apis: ['./source/routes/*']
};

const swaggerSpec = swaggerJsdoc(options);

console.log('Especificación de Swagger:', swaggerSpec);

interface SetupSwagger {
  (app: import('express').Application): void;
}

const setupSwagger: SetupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;
