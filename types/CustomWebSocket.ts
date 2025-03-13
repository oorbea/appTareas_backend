import { WebSocket } from 'ws';
import { UserPayload } from '../source/models/user';

export interface CustomWebSocket extends WebSocket {
    user?: UserPayload;
}
