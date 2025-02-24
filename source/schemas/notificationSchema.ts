import z from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const notificationSchema = z.object({
  when: z.string({ message: 'La fecha debe ser un string' })
    .date('La fecha debe ser una fecha')
    .refine(value => new Date(value) > new Date(Date.now()), { message: 'La fecha debe ser posterior a la actual' }),
  task: z.number({ message: 'La tarea debe ser un número' })
    .int({ message: 'La tarea debe ser un número entero' })
    .min(1, { message: 'La tarea debe ser un número mayor a 0' })
    .max(9999999999, { message: 'La tarea debe ser un número de como mucho 10 dígitos' }),
  enabled: z.boolean({ message: 'El estado debe ser un booleano' })
    .optional()
});

export const notificationWhenSchema = z.object({
  when: z.string({ message: 'La fecha debe ser un string' })
    .date('La fecha debe ser una fecha')
    .refine(value => new Date(value) > new Date(Date.now()), { message: 'La fecha debe ser posterior a la actual' })
});

export const notificationTaskSchema = z.object({
  task: z.number({ message: 'La tarea debe ser un número' })
    .int({ message: 'La tarea debe ser un número entero' })
    .min(1, { message: 'La tarea debe ser un número mayor a 0' })
    .max(9999999999, { message: 'La tarea debe ser un número de como mucho 10 dígitos' })
});

export const notificationSchemaSwagger = zodToJsonSchema(notificationSchema);
