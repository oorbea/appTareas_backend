import { userSchema, usernameSchema, passwordSchema, emailSchema } from './schemas/userSchema.mjs';
import { taskListSchema, taskListNameSchema } from './schemas/taskListSchema.mjs';
import { taskSchema, taskUserSchema } from './schemas/taskSchema.mjs';

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

function validateTaskList (taskList) {
  return taskListSchema.safeParse(taskList);
}

function validateTaskListName (taskList) {
  return taskListNameSchema.safeParse(taskList);
}

function validateTask (task) {
  return taskSchema.safeParse(task);
}

function validateTaskUser (user) {
  return taskUserSchema.safeParse(user);
}

export { validateUser, validateUsername, validatePassword, validateEmail, validateTaskList, validateTaskListName, validateTask, validateTaskUser };
