import Network from './network';
import { ClientTypes } from '../types/index.type';
import SessionManager from './session';
import Methods from './methods';
type M = ClientTypes.Middleware<ClientTypes.ContextMap['message']>;
type H = ClientTypes.Handler<ClientTypes.ContextMap['message']>;

export default class Client extends Methods {
	public initialize = false;
	public key?: Buffer<ArrayBuffer>;
	public privateKey?: string;
	public decode_auth?: string;
	public auth?: string;
	public sessionDb: SessionManager;
	public network: Network;
	public plugins: ClientTypes.RubPlugin[] = [];
	public errorMiddlewares: ClientTypes.ErrorMiddleware[] = [];
	public cmd: {
		pattern: string | RegExp;
		middlewares: ClientTypes.MiddlewareChain<ClientTypes.ContextMap['message']>;
	}[] = [];

	public handlers: {
		[K in ClientTypes.TypeUpdate]: ClientTypes.MiddlewareChain<
			ClientTypes.ContextMap[K]
		>[];
	} = {
		chat: [],
		message: [],
		activities: [],
		notifications: [],
	};

	userGuid?: string;

	constructor(
		private session: ClientTypes.SessionType,
		public platform: ClientTypes.PlatformType = 'Web',
		public timeout: number = 5000,
	) {
		super();
		this.sessionDb = new SessionManager(session);
		this.network = new Network(this);

		this.start();
	}

	// Overloads
	on<K extends ClientTypes.TypeUpdate>(
		updateType: K,
		handler: ClientTypes.Handler<ClientTypes.ContextMap[K]>,
	): void;
	on<K extends ClientTypes.TypeUpdate>(
		updateType: K,
		m1: ClientTypes.Middleware<ClientTypes.ContextMap[K]>,
		handler: ClientTypes.Handler<ClientTypes.ContextMap[K]>,
	): void;
	on<K extends ClientTypes.TypeUpdate>(
		updateType: K,
		m1: ClientTypes.Middleware<ClientTypes.ContextMap[K]>,
		m2: ClientTypes.Middleware<ClientTypes.ContextMap[K]>,
		handler: ClientTypes.Handler<ClientTypes.ContextMap[K]>,
	): void;
	on<K extends ClientTypes.TypeUpdate>(
		updateType: K,
		m1: ClientTypes.Middleware<ClientTypes.ContextMap[K]>,
		m2: ClientTypes.Middleware<ClientTypes.ContextMap[K]>,
		m3: ClientTypes.Middleware<ClientTypes.ContextMap[K]>,
		handler: ClientTypes.Handler<ClientTypes.ContextMap[K]>,
	): void;

	on<K extends ClientTypes.TypeUpdate>(
		updateType: K,
		...funcs: ClientTypes.MiddlewareChain<ClientTypes.ContextMap[K]>
	): void {
		if (funcs.length === 0) {
			throw new Error('At least one handler is required.');
		}

		const last = funcs[funcs.length - 1];
		if (last.length !== 1) {
			throw new Error('Last argument must be a handler (ctx => Promise<void>)');
		}

		this.handlers[updateType].push(funcs);
	}

	// Overloads
	command(pattern: string | RegExp, handler: H): void;
	command(pattern: string | RegExp, m1: M, handler: H): void;
	command(pattern: string | RegExp, m1: M, m2: M, handler: H): void;
	command(pattern: string | RegExp, m1: M, m2: M, m3: M, handler: H): void;
	command(pattern: string | RegExp, ...handlers: (M | H)[]): void {
		if (handlers.length === 0) {
			throw new Error('At least one handler is required.');
		}

		const last = handlers[handlers.length - 1];
		if (last.length !== 1) {
			throw new Error('Last handler must be of type (ctx) => Promise<void>');
		}

		this.cmd.push({
			pattern,
			middlewares: handlers as [...M[], H],
		});
	}
}
