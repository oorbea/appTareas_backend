import { UserPayload } from '../source/authenticate';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
