import { userSchema, usernameSchema, passwordSchema, emailSchema } from './schemas/userSchema.mjs';

function validateUser (user) {
  return userSchema.safeParse(user);
}

function validateUsername (username) {
  return usernameSchema.safeParse(username);
}

function validatePassword (password) {
  return passwordSchema.safeParse(password);
}

function validateEmail (email) {
  return emailSchema.safeParse(email);
}

export { validateUser, validateUsername, validatePassword, validateEmail };
