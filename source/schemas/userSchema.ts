import z from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const userSchema = z.object({
  id: z.number({ message: 'El ID debe ser un número' })
    .int({ message: 'El ID debe ser un número entero' })
    .min(1, { message: 'El ID debe ser un número mayor a 0' })
    .max(9999999999, { message: 'El ID debe ser un número de como mucho 10 dígitos' })
    .optional(),
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
    .nonempty({ message: 'El email es obligatorio' }),
  picture: z.string({ message: 'El picture debe ser un string' })
    .nullable()
    .optional(),
  resetPasswordCode: z.number({ message: 'El resetPasswordCode debe ser un número' })
    .int({ message: 'El resetPasswordCode debe ser un número entero' })
    .min(10000000, { message: 'El resetPasswordCode debe ser un número de 8 dígitos' })
    .max(99999999, { message: 'El resetPasswordCode debe ser un número de 8 dígitos' })
    .nullable()
    .optional(),
  resetPasswordExpires: z.string({ message: 'El resetPasswordExpires debe ser un string' })
    .date('El resetPasswordExpires debe ser una fecha')
    .nullable()
    .optional(),
  admin: z.boolean({ message: 'El admin debe ser un booleano' })
    .optional(),
  enabled: z.boolean({ message: 'El estado debe ser un booleano' })
    .optional()
});

export const usernameSchema = z.object({}).merge(userSchema.pick({ username: true }));

export const passwordSchema = z.object({}).merge(userSchema.pick({ password: true }));

export const emailSchema = z.object({}).merge(userSchema.pick({ email: true }));

export const userSchemaSwagger = zodToJsonSchema(userSchema.pick({
  username: true,
  email: true,
  password: true,
  picture: true
}));
export const completeUserSchemaSwagger = zodToJsonSchema(userSchema);
