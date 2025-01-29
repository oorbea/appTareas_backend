import { userSchema, passwordSchema } from './schemas/userSchema.mjs';

function validateUser (user) {
  return userSchema.safeParse(user);
}

function validatePassword (password) {
  return passwordSchema.safeParse(password);
}

export { validateUser, validatePassword };
