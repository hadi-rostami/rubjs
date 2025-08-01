import InlineMessage from '../contexts/inline.context';
import Message from '../contexts/message.context';

export interface Session {
	iv: string;
	enData: string;
}

export type SessionType = string | Session;

export interface BotType {
	bot_id: string;
	bot_title: string;
	avatar: { file_id: string };
	description: string;
	username: string;
	start_message: string;
}

export interface ContextMap {
	message: Message;
	inline: InlineMessage;
}

export type FilterFn<T> = (ctx: T) => boolean | Promise<boolean>;
export type NestedFilter<T> = Array<FilterFn<T> | FilterFn<T>[]>;

export type Handler<T> = {
	filters: NestedFilter<T>;
	handler: (ctx: T) => Promise<void>;
	prefix?: string | RegExp;
};
