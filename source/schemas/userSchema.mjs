import z from 'zod';

export const userSchema = z.object({
  username: z.string({ message: 'Username must be a string' })
    .max(30, { message: 'Username must be at most 30 characters long' })
    .nonempty({ message: 'Username is required' }),
  password: z.string({ message: 'Password must be a string' })
    .max(100, { message: 'Password must be at most 100 characters long' })
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .nonempty({ message: 'Password is required' }),
  email: z.string({ message: 'Email must be a string' })
    .email({ message: 'Email must be a valid email address' })
    .nonempty({ message: 'Email is required' })
});
