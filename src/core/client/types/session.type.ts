export interface ClientSession {
	phone: string;
	auth: string;
	guid: string;
	agent: string;
	private_key: string;
}

export interface BotSession {
	token: string;
}

export type SessionData = ClientSession | BotSession;
