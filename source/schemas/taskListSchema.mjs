import z from 'zod';

export const taskListSchema = z.object({
  name: z.string({ message: 'El nombre debe ser un string' })
    .max(30, { message: 'El nombre no puede exceder los 30 carácteres de longitud' })
    .nonempty({ message: 'El nombre es obligatorio' })
});
