import z from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const taskSchema = z.object({
  title: z.string({ message: 'El título debe ser un string' })
    .max(50, { message: 'El título no puede exceder los 50 carácteres de longitud' })
    .nonempty({ message: 'El título es obligatorio' }),
  user: z.number({ message: 'El usuario debe ser un número' })
    .int({ message: 'El usuario debe ser un número entero' })
    .min(1, { message: 'El usuario debe ser un número mayor a 0' })
    .max(9999999999, { message: 'El usuario debe ser un número de como mucho 10 dígitos' })
    .optional(),
  details: z.string({ message: 'Los detalles deben ser un string' })
    .max(1000, { message: 'Los detalles no pueden exceder los 1000 carácteres de longitud' })
    .optional(),
  deadline: z.string({ message: 'La fecha límite debe ser un string' })
    .date('La fecha límite debe ser una fecha')
    .optional(),
  parent: z.number({ message: 'La tarea padre debe ser un número' })
    .int({ message: 'El padre debe ser un número entero' })
    .min(1, { message: 'El padre debe ser un número mayor a 0' })
    .max(9999999999, { message: 'El padre debe ser un número de como mucho 10 dígitos' })
    .optional(),
  difficulty: z.number({ message: 'La dificultad debe ser un número' })
    .int({ message: 'La dificultad debe ser un número entero' })
    .min(1, { message: 'La dificultad debe ser un número mayor a 0' })
    .max(5, { message: 'La dificultad debe ser un número menor a 6' })
    .optional()
    .default(1),
  lat: z.number({ message: 'La latitud debe ser un número' })
    .min(-90, { message: 'La latitud debe ser un número mayor o igual a -90' })
    .max(90, { message: 'La latitud debe ser un número menor o igual a 90' })
    .optional(),
  lng: z.number({ message: 'La longitud debe ser un número' })
    .min(-180, { message: 'La longitud debe ser un número mayor o igual a -180' })
    .max(180, { message: 'La longitud debe ser un número menor o igual a 180' })
    .optional(),
  list: z.number({ message: 'La lista debe ser un número' })
    .int({ message: 'La lista debe ser un número entero' })
    .min(1, { message: 'La lista debe ser un número mayor a 0' })
    .max(9999999999, { message: 'La lista debe ser un número de como mucho 10 dígitos' })
    .optional(),
  favourite: z.boolean({ message: 'El favorito debe ser un booleano' })
    .optional(),
  done: z.boolean({ message: 'El completado debe ser un booleano' })
    .optional(),
  enabled: z.boolean({ message: 'El estado debe ser un booleano' })
    .optional()
});

export const taskTitleSchema = z.object({
  title: z.string({ message: 'El título debe ser un string' })
    .max(50, { message: 'El título no puede exceder los 50 carácteres de longitud' })
    .nonempty({ message: 'El título es obligatorio' })
});

export const taskUserSchema = z.object({
  user: z.number({ message: 'El usuario debe ser un número' })
    .int({ message: 'El usuario debe ser un número entero' })
    .min(1, { message: 'El usuario debe ser un número mayor a 0' })
    .max(9999999999, { message: 'El usuario debe ser un número de como mucho 10 dígitos' })
});

export const taskDetailsSchema = z.object({
  details: z.string({ message: 'Los detalles deben ser un string' })
    .max(1000, { message: 'Los detalles no pueden exceder los 1000 carácteres de longitud' })
    .nullable()
});

export const taskDeadlineSchema = z.object({
  deadline: z.string({ message: 'La fecha límite debe ser un string' })
    .date('La fecha límite debe ser una fecha')
    .nullable()
});

export const taskParentSchema = z.object({
  parent: z.number({ message: 'La tarea padre debe ser un número' })
    .int({ message: 'El padre debe ser un número entero' })
    .min(1, { message: 'El padre debe ser un número mayor a 0' })
    .max(9999999999, { message: 'El padre debe ser un número de como mucho 10 dígitos' })
    .nullable()
});

export const taskDifficultySchema = z.object({
  difficulty: z.number({ message: 'La dificultad debe ser un número' })
    .int({ message: 'La dificultad debe ser un número entero' })
    .min(1, { message: 'La dificultad debe ser un número mayor a 0' })
    .max(5, { message: 'La dificultad debe ser un número menor a 6' })
});

export const taskLocationSchema = z.object({
  lat: z.number({ message: 'La latitud debe ser un número' })
    .min(-90, { message: 'La latitud debe ser un número mayor o igual a -90' })
    .max(90, { message: 'La latitud debe ser un número menor o igual a 90' })
    .nullable(),
  lng: z.number({ message: 'La longitud debe ser un número' })
    .min(-180, { message: 'La longitud debe ser un número mayor o igual a -180' })
    .max(180, { message: 'La longitud debe ser un número menor o igual a 180' })
    .nullable()
});

export const taskListSchema = z.object({
  list: z.number({ message: 'La lista debe ser un número' })
    .int({ message: 'La lista debe ser un número entero' })
    .min(1, { message: 'La lista debe ser un número mayor a 0' })
    .max(9999999999, { message: 'La lista debe ser un número de como mucho 10 dígitos' })
    .nullable()
});

export const taskFavouriteSchema = z.object({
  favourite: z.boolean({ message: 'El favorito debe ser un booleano' })
});

export const taskDoneSchema = z.object({
  done: z.boolean({ message: 'El completado debe ser un booleano' })
});

export const taskSchemaSwagger = zodToJsonSchema(taskSchema);
