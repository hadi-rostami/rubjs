import Client from '../core/client';
import Chat from './chat.type';
import { Activities } from './index.type';
import Message from './message.type';
import Notifications from './notifications.type';

export interface Session {
	iv: string;
	enData: string;
}
export type TypeUpdate = 'activities' | 'chat' | 'message' | 'notifications';

export type SessionType = string | Session;
export type PlatformType = 'Android' | 'Web';


export type ErrorMiddleware = (
	error: any,
	ctx: Message,
	next: () => Promise<void>,
) => Promise<void>;


// پلاگین
type PluginFunction = (client: Client) => Promise<void>;

export interface RubPlugin {
	name: string;
	version?: string;
	run: PluginFunction;
}

export type ContextMap = {
	chat: Chat;
	message: Message;
	activities: Activities;
	notifications: Notifications;
};

export type Middleware<C> = (
	ctx: C,
	next: () => Promise<void>,
) => Promise<void>;
export type Handler<C> = (ctx: C) => Promise<void>;
export type MiddlewareChain<C> = [...Middleware<C>[], Handler<C>];



export interface Command<C> {
	pattern: string | RegExp;
	middlewares: MiddlewareChain<C>;
  }
  