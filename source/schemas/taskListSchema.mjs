import z from 'zod';

export const taskListSchema = z.object({
  name: z.string({ message: 'El nombre debe ser un string' })
    .max(30, { message: 'El nombre no puede exceder los 30 carácteres de longitud' }),
  user: z.number({ message: 'El usuario debe ser un número' })
    .int({ message: 'El usuario debe ser un número entero' })
    .min(1, { message: 'El usuario debe ser un número mayor a 0' })
    .max(9999999999, { message: 'El usuario debe ser un número de como mucho 10 dígitos' }),
  enabled: z.boolean({ message: 'El estado debe ser un booleano' })
});

export const taskListNameSchema = z.object({
  name: z.string({ message: 'El nombre debe ser un string' })
    .max(30, { message: 'El nombre no puede exceder los 30 carácteres de longitud' })
    .nonempty({ message: 'El nombre es obligatorio' })
});
