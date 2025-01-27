import { userSchema } from './schemas/userSchema.mjs';

function validateUser (user) {
  return userSchema.safeParse(user);
}

export { validateUser };
