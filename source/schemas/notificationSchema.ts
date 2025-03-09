import z from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { NotificationStatus, NotificationType } from '../models/notification';

export const notificationSchema = z.object({
  id: z.number({ message: 'El id debe ser un número' })
    .int({ message: 'El id debe ser un número entero' })
    .min(1, { message: 'El id debe ser un número mayor a 0' })
    .max(9999999999, { message: 'El id debe ser un número de como mucho 10 dígitos' })
    .optional(),
  scheduledTime: z.string({ message: 'La fecha debe ser un string' })
    .date('La fecha debe ser una fecha')
    .refine(value => new Date(value) > new Date(Date.now()), { message: 'La fecha debe ser posterior a la actual' }),
  task: z.number({ message: 'La tarea debe ser un número' })
    .int({ message: 'La tarea debe ser un número entero' })
    .min(1, { message: 'La tarea debe ser un número mayor a 0' })
    .max(9999999999, { message: 'La tarea debe ser un número de como mucho 10 dígitos' }),
  user: z.number({ message: 'El usuario debe ser un número' })
    .int({ message: 'El usuario debe ser un número entero' })
    .min(1, { message: 'El usuario debe ser un número mayor a 0' })
    .max(9999999999, { message: 'El usuario debe ser un número de como mucho 10 dígitos' })
    .optional(),
  status: z.nativeEnum(NotificationStatus, { message: 'El estado debe ser uno de: pending | sent | failed' })
    .optional(),
  message: z.string({ message: 'El mensaje debe ser un string' })
    .max(255, { message: 'El mensaje debe tener como mucho 255 caracteres' })
    .nullable()
    .optional(),
  type: z.nativeEnum(NotificationType, { message: 'El tipo debe ser uno de: reminder | deadline | recurring | urgent | custom' })
    .optional(),
  enabled: z.boolean({ message: 'El estado debe ser un booleano' })
    .optional()
});

export const notificationScheduledTimeSchema = z.object({
  scheduledTime: z.string({ message: 'La fecha debe ser un string' })
    .date('La fecha debe ser una fecha')
    .refine(value => new Date(value) > new Date(Date.now()), { message: 'La fecha debe ser posterior a la actual' })
});

export const notificationTaskSchema = z.object({
  task: z.number({ message: 'La tarea debe ser un número' })
    .int({ message: 'La tarea debe ser un número entero' })
    .min(1, { message: 'La tarea debe ser un número mayor a 0' })
    .max(9999999999, { message: 'La tarea debe ser un número de como mucho 10 dígitos' })
});

export const notificationMessageSchema = z.object({
  message: z.string({ message: 'El mensaje debe ser un string' })
    .max(255, { message: 'El mensaje debe tener como mucho 255 caracteres' })
    .nullable()
});

export const notificationTypeSchema = z.object({
  type: z.nativeEnum(NotificationType, { message: 'El tipo debe ser uno de: reminder | deadline | recurring | urgent | custom' })
});

export const notificationSchemaSwagger = zodToJsonSchema(notificationSchema.pick({
  scheduledTime: true,
  task: true,
  message: true,
  type: true
}));
export const completeNotificationSchemaSwagger = zodToJsonSchema(notificationSchema);
