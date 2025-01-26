import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

const PORT = process.env.PORT ?? 5000;
const BASE_URL = `http://localhost:${PORT}`;

// Opciones de configuración para swagger-jsdoc
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
        url: BASE_URL, // Ajusta la URL base según tu entorno
        description: 'Servidor local'
      }
    ]
  },
  apis: ['./source/app.mjs'] // Especifica el archivo donde están los endpoints documentados
};

// Genera la especificación de Swagger
const swaggerSpec = swaggerJsdoc(options);

console.log('Especificación de Swagger:', swaggerSpec);

// Función para configurar Swagger UI
const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export { setupSwagger };
