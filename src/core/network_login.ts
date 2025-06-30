import { Agent, request as undiciRequest } from 'undici';
import Crypto from './crypto';

interface PlatformInfo {
	app_name: string;
	app_version: string;
	platform: string;
	package: string;
	lang_code: string;
}

interface AuthInfo {
	auth?: string;
	decode_auth?: string;
	key?: Buffer;
	privateKey?: string;
}

interface SendOptions {
	input?: Record<string, any>;
	method?: string;
	tmp_session?: boolean;
}

interface DCResponse {
	data: {
		default_api: string;
		API: { [key: string]: string };
	};
}

interface ServerResponse {
	data_enc?: string;
	status?: string;
	status_det?: string;
	data?: Record<string, any>;
}

class Network {
	private headers: Record<string, string>;
	private agent: Agent;
	private apiUrl: string | null = null;
	defaultPlatform: PlatformInfo = {
		app_name: 'Main',
		app_version: '4.4.9',
		platform: 'Web',
		package: 'web.rubika.ir',
		lang_code: 'fa',
	};

	userAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36`;

	constructor() {
		this.headers = {
			origin: 'https://web.rubika.ir',
			referer: 'https://web.rubika.ir/',
			'content-type': 'application/json',
			connection: 'keep-alive',
			'user-agent': this.userAgent,
		};

		this.agent = new Agent({
			connect: {
				rejectUnauthorized: false,
			},
		});
	}

	/**
	 * Retrieves API and WSS server URLs
	 */
	async getDcs(): Promise<boolean> {
		const url = 'https://getdcmess.iranlms.ir/';
		const RETRY_DELAY = 3000;

		while (true) {
			try {
				const res = await undiciRequest(url, {
					method: 'GET',
					dispatcher: this.agent,
				});

				if (res.statusCode === 200) {
					const body = (await res.body.json()) as {
						data?: {
							API: Record<string, string>;
							socket: Record<string, string>;
							default_api: string;
							default_socket: string;
						};
					};

					if (body?.data) {
						const dcs = body.data;
						this.apiUrl = `${dcs.API[dcs.default_api]}/`;
						return true;
					}
				}

				console.warn(
					'[getDcs] Unexpected status or data format:',
					res.statusCode,
				);
			} catch (error: unknown) {
				console.error('[getDcs] Error:', error);
			}

			await this.delay(RETRY_DELAY);
		}
	}

	/**
	 * Sends a POST request with retry logic and enhanced error reporting
	 */
	async request(url: string, data: Record<string, any>): Promise<any> {
		const MAX_ATTEMPTS = 3;

		for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
			try {
				const res = await undiciRequest(url, {
					method: 'POST',
					headers: {
						'content-type': 'application/json',
						...this.headers,
					},
					body: JSON.stringify(data),
					dispatcher: this.agent,
				});

				if (res.statusCode === 200) {
					const responseData = await res.body.json();

					return responseData;
				} else {
					console.warn(
						`[request] Attempt ${attempt}: Unexpected status ${res.statusCode}`,
					);
				}
			} catch (error: unknown) {
				console.error(`[request] Attempt ${attempt} failed:`, error);
			}

			await this.delay(1000);
		}

		throw new Error(`[request] Failed after ${MAX_ATTEMPTS} attempts: ${url}`);
	}

	async send(
		{ input = {}, method = 'getUserInfo', tmp_session }: SendOptions,
		{ auth, decode_auth, key, privateKey }: AuthInfo,
	): Promise<ServerResponse | undefined> {
		if (!this.apiUrl) await this.getDcs();

		const payload: Record<string, any> = {
			api_version: '6',
			[tmp_session ? 'tmp_session' : 'auth']: tmp_session ? auth : decode_auth,
		};

		const data_enc = JSON.stringify({
			client: this.defaultPlatform,
			method,
			input,
		});

		payload['data_enc'] = Crypto.encrypt(data_enc, key!);

		if (!tmp_session && privateKey) {
			payload['sign'] = Crypto.sign(payload['data_enc'], privateKey);
		}

		return await this.request(this.apiUrl!, payload);
	}

	async bulder(
		name: string,
		input: Record<string, any>,
		{ auth, key, decode_auth, privateKey }: AuthInfo,
		tmp_session = false,
	): Promise<Record<string, any> | undefined> {
		if (!auth) auth = Crypto.secret(32);
		if (!key) key = Buffer.from(Crypto.passphrase(auth), 'utf8');

		const result = await this.send(
			{
				input,
				tmp_session,
				method: name,
			},
			{ auth, key, decode_auth, privateKey },
		);

		if (result) {
			const { data_enc } = result;
			if (data_enc) {
				const decrypted = Crypto.decrypt(data_enc, key);
				const parsed = JSON.parse(decrypted);

				if (parsed.status === 'OK' && parsed.status_det === 'OK') {
					return { ...parsed.data, auth_data: auth, key_data: key };
				}
			}
		}
	}

  	/**
	 * Delay utility
	 */
	public delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

export default Network;
