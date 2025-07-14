import Client from '../core/client';
import Chat from '../core/context/chat.type';
import Activities from '../core/context/activities.type';
import Message from '../core/context/message.type';
import Notifications from '../core/context/notifications.type';

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

export interface ContextMap {
	chat: Chat;
	message: Message;
	activities: Activities;
	notifications: Notifications;
}

export type Handler<T> = {
	filters: Array<(ctx: T) => boolean | Promise<boolean>>;
	handler: (ctx: T) => Promise<void>;
	prefix?: string | RegExp;
};
