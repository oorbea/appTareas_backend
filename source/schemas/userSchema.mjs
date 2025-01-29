import z from 'zod';

export const userSchema = z.object({
  username: z.string({ message: 'El username debe ser un string' })
    .max(30, { message: 'El username no puede exceder los 30 carácteres de longitud' })
    .nonempty({ message: 'El username es obligatorio' }),
  password: z.string({ message: 'El password debe ser un string' })
    .max(100, { message: 'El password no puede exceder los 100 carácteres de longitud' })
    .min(8, { message: 'El password debe ser de almenos 8 carácteres de longitud' })
    .regex(/[A-Z]/, { message: 'El password debe contener almenos una letra mayúscula' })
    .regex(/[a-z]/, { message: 'El password debe contener almenos una letra minúscula' })
    .regex(/[0-9]/, { message: 'El password debe contener almenos un número' })
    .nonempty({ message: 'El password es obligatorio' }),
  email: z.string({ message: 'El email debe ser un string' })
    .email({ message: 'El email debe ser una dirección de correo válida' })
    .nonempty({ message: 'El email es obligatorio' })
});

export const passwordSchema = z.object({}).merge(userSchema.pick({ password: true }));
