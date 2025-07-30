import SessionManager from '../../utils/session';
import Message from './contexts/message.context';
import Methods from './methods';
import Network from './network';
import {
	BotType,
	ContextMap,
	Handler,
	SessionType,
} from './types/bot.type';
import Fastify, { FastifyInstance } from 'fastify';

class Bot extends Methods {
	public BASE_URL = `https://botapi.rubika.ir/v3`;
	protected sessionDB: SessionManager;
	protected initialize = false;
	protected network: Network;
	public sendToken: string = '';
	public handlers: {
		[K in keyof ContextMap]: Handler<ContextMap[K]>[];
	} = { inline: [], message: [] };
	public server: FastifyInstance;

	public bot?: BotType;

	constructor(public token: SessionType) {
		super();
		this.sessionDB = new SessionManager(token, undefined, 'BOT');
		this.network = new Network(this);
		this.server = Fastify();

		this.start();
	}

	on<T extends keyof typeof this.handlers>(
		type: T,
		handler: (ctx: ContextMap[T]) => Promise<void>,
	): void;

	on<T extends keyof typeof this.handlers>(
		type: T,
		filters: Array<(ctx: ContextMap[T]) => boolean | Promise<boolean>>,
		handler: (ctx: ContextMap[T]) => Promise<void>,
	): void;

	on<T extends keyof typeof this.handlers>(
		type: T,
		filtersOrHandler:
			| Array<(ctx: ContextMap[T]) => boolean | Promise<boolean>>
			| ((ctx: ContextMap[T]) => Promise<void>),
		maybeHandler?: (ctx: ContextMap[T]) => Promise<void>,
	): void {
		if (typeof filtersOrHandler === 'function') {
			this.handlers[type].push({
				filters: [],
				handler: filtersOrHandler,
			});
		} else if (Array.isArray(filtersOrHandler) && maybeHandler) {
			this.handlers[type].push({
				filters: filtersOrHandler,
				handler: maybeHandler,
			});
		}
	}

	command(
		prefix: string | RegExp,
		handler: (ctx: Message) => Promise<void>,
	): void;

	command(
		prefix: string | RegExp,
		filters: Array<(ctx: Message) => boolean | Promise<boolean>>,
		handler: (ctx: Message) => Promise<void>,
	): void;

	command(
		prefix: string | RegExp,
		filtersOrHandler:
			| Array<(ctx: Message) => boolean | Promise<boolean>>
			| ((ctx: Message) => Promise<void>),
		maybeHandler?: (ctx: Message) => Promise<void>,
	) {
		if (typeof filtersOrHandler === 'function') {
			this.handlers.message.push({
				filters: [],
				handler: filtersOrHandler,
				prefix,
			});
		} else if (Array.isArray(filtersOrHandler) && maybeHandler) {
			this.handlers.message.push({
				filters: filtersOrHandler,
				handler: maybeHandler,
				prefix,
			});
		} else {
			throw new Error('Invalid arguments for command()');
		}
	}
}

export default Bot;
