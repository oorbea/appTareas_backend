import { userSchema, usernameSchema, passwordSchema, emailSchema } from './schemas/userSchema';
import { taskListSchema, taskListNameSchema } from './schemas/taskListSchema';
import { taskSchema, taskTitleSchema, taskUserSchema } from './schemas/taskSchema';

class Validation {
  public static validateUser (user: object) {
    return userSchema.safeParse(user);
  }

  public static validateUsername (username: object) {
    return usernameSchema.safeParse(username);
  }

  public static validatePassword (password: object) {
    return passwordSchema.safeParse(password);
  }

  public static validateEmail (email: object) {
    return emailSchema.safeParse(email);
  }

  public static validateTaskList (taskList: object) {
    return taskListSchema.safeParse(taskList);
  }

  public static validateTaskListName (taskList: object) {
    return taskListNameSchema.safeParse(taskList);
  }

  public static validateTask (task: object) {
    return taskSchema.safeParse(task);
  }

  public static validateTaskUser (user: object) {
    return taskUserSchema.safeParse(user);
  }

  public static validateTaskTitle (title: object) {
    return taskTitleSchema.safeParse(title);
  }
}

export default Validation;
