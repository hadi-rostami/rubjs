import {
	Agent,
	request as undiciRequest,
	WebSocket as UndiciWebSocket,
} from 'undici';
import UserAgent from 'user-agents';
import {
	Activities,
	ClientTypes,
	Message,
	NetworkTypes,
} from '../types/index.type';
import Client from './client';
import Crypto from './crypto';
import fs from 'fs';
import path from 'path';
import Chat from '../types/chat.type';
import Notifications from '../types/notifications.type';

const types = {
	activities: 'show_activities',
	chat: 'chat_updates',
	message: 'message_updates',
	notifications: 'show_notifications',
};

export default class Network {
	public headers: Record<string, string>;
	public userAgent = new UserAgent().toString();
	public defaultPlatform: NetworkTypes.Platform;
	private apiVersion = '6';
	private agent: Agent;
	private apiUrl?: string;
	private wssUrl?: string;
	private ws?: InstanceType<typeof UndiciWebSocket>;
	private heartbeatInterval?: NodeJS.Timeout;
	private inactivityTimeout?: NodeJS.Timeout;
	private reconnecting: boolean = false;

	constructor(private client: Client) {
		this.defaultPlatform = this.resolvePlatform(client.platform);
		this.headers = this.buildHeaders(client.platform);
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
						this.wssUrl = dcs.socket[dcs.default_socket];
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

	async send({
		input = {},
		method = 'getUserInfo',
		tmp_session,
	}: {
		input?: Record<string, any>;
		method?: string;
		tmp_session: boolean;
	}): Promise<any> {
		while (!this.apiUrl) {
			await this.getDcs();
			await this.delay(1000);
		}

		const { auth, decode_auth, key, privateKey } = this.client;
		if (!key) return;

		const credentialsKey = tmp_session ? 'tmp_session' : 'auth';
		const credentialsValue = tmp_session ? auth : decode_auth;

		const payload: Record<string, any> = {
			api_version: this.apiVersion,
			[credentialsKey]: credentialsValue,
		};

		const dataPayload = JSON.stringify({
			client: this.defaultPlatform,
			method,
			input,
		});

		payload.data_enc = Crypto.encrypt(dataPayload, key);

		if (!tmp_session && privateKey) {
			payload.sign = Crypto.sign(payload.data_enc, privateKey);
		}

		return this.request(this.apiUrl!, payload);
	}

	async getUpdates() {
		while (!this.wssUrl) {
			await this.getDcs();
			await this.delay(1000);
		}

		this.ws = new UndiciWebSocket(this.wssUrl);
		this.ws.addEventListener('open', async () => {
			await this.handleConnect();
			this.resetInactivityTimer();
		});

		this.ws.addEventListener('message', async (event) => {
			await this.handleMessage(event.data);
			this.resetInactivityTimer();
		});

		this.ws.addEventListener('error', async (event) => {
			if (!this.reconnecting) {
				console.error('WebSocket error, reconnecting...');
				this.reconnecting = true;
				await this.resetConnection();
			}
		});

		this.ws.addEventListener('close', async () => {
			if (!this.reconnecting) {
				console.warn('WebSocket closed, reconnecting...');
				this.reconnecting = true;
				await this.resetConnection();
			}
		});
	}

	async handleConnect() {
		console.log('Start Bot..');
		if (this.ws?.readyState === UndiciWebSocket.OPEN) {
			this.ws?.send(
				JSON.stringify({
					api_version: '5',
					auth: this.client.auth,
					data: '',
					method: 'handShake',
				}),
			);
		}
		if (this.heartbeatInterval) clearInterval(this.heartbeatInterval!);

		this.heartbeatInterval = setInterval(() => {
			if (this.ws?.readyState === WebSocket.OPEN) {
				this.ws.send(JSON.stringify({}));
			}
		}, 30000);
	}

	async handleMessage(message: string) {
		const { data_enc } = JSON.parse(message);
		if (!data_enc || !this.client.key) return;

		const update = JSON.parse(Crypto.decrypt(data_enc, this.client.key));
		for (let [event, data] of Object.entries(this.client.handlers)) {
			if (data.length === 0) continue;

			// has message
			const updates = update[types[event as ClientTypes.TypeUpdate]];
			if (!Array.isArray(updates) || updates.length === 0) continue;

			// get user name
			let username: string | null = null;
			const notification = update.show_notifications?.[0];
			const chatUpdate = update.chat_updates?.[0];

			if (notification) {
				const objectGuid = notification?.message_data?.object_guid;
				if (objectGuid?.startsWith('u0')) username = notification.title;
				else if (objectGuid?.startsWith('g0'))
					username = notification.text?.split(':')[0];
			} else if (chatUpdate) {
				username =
					chatUpdate.chat?.last_message?.author_title || 'Unknown User';
			} else username = 'Unknown User';

			// start handlers
			for (let messageData of updates) {
				messageData = {
					client_guid: this.client.userGuid,
					...messageData,
					message: {
						author_title: username,
						...messageData.message,
					},
				};

				for (const chain of data) {
					await this.runMiddlewareChain(
						event as any,
						chain,
						messageData,
						this.client,
					);
				}
			}
		}

		if (update?.message_updates) {
			for (let ctx of update.message_updates) {
				ctx = new Message(this.client, ctx);

				for (const { middlewares, pattern } of this.client.cmd) {
					const text = ctx.message?.text;
					if (!text) return;

					if (
						(typeof pattern === 'string' && text === pattern) ||
						(pattern instanceof RegExp && pattern.test(text))
					) {
						await this.runMiddlewareChain(
							'message',
							middlewares,
							ctx,
							this.client,
						);
					}
				}
			}
		}
	}

	private async runMiddlewareChain<K extends ClientTypes.TypeUpdate>(
		event: K,
		middlewares: ClientTypes.MiddlewareChain<ClientTypes.ContextMap[K]>,
		ctx: ClientTypes.ContextMap[K],
		client: Client,
	): Promise<void> {
		let index = -1;

		if (event === 'message') {
			ctx = new Message(client, ctx as Message) as ClientTypes.ContextMap[K];
		} else if (event === 'chat') {
			ctx = new Chat(client, ctx as Chat) as ClientTypes.ContextMap[K];
		} else if (event === 'activities') {
			ctx = new Activities(
				client,
				ctx as Activities,
			) as ClientTypes.ContextMap[K];
		} else if (event === 'notifications') {
			ctx = new Notifications(
				client,
				ctx as Notifications,
			) as ClientTypes.ContextMap[K];
		}

		const dispatch = async (i: number): Promise<void> => {
			if (i <= index) throw new Error('next() called multiple times');
			index = i;

			if (i === middlewares.length) return;

			const fn = middlewares[i];

			try {
				await fn(ctx, () => dispatch(i + 1));
			} catch (err) {
				await this.client.runErrorMiddlewares(err, ctx);
			}
		};

		await dispatch(0);
	}

	async resetConnection() {
		this.ws?.close();
		this.ws = undefined;
		setTimeout(async () => {
			await this.getUpdates();
			this.reconnecting = false;
		}, 5000);
	}

	private resetInactivityTimer() {
		clearTimeout(this.inactivityTimeout!);
		this.inactivityTimeout = setTimeout(
			async () => {
				console.warn(
					'No updates received for 10 minutes. Reconnecting WebSocket...',
				);
				await this.resetConnection();
			},
			10 * 60 * 1000,
		);
	}

	async uploadFile(
		filePath: string,
		chunkSize: number = 1048576,
	): Promise<any> {
		if (!fs.existsSync(filePath))
			throw new Error('File not found in the given path');

		const stat = await fs.promises.stat(filePath);
		const fileSize = stat.size;
		const fileName = path.basename(filePath);
		const mime = filePath.split('.').pop();

		let result = await this.client.requestSendFile(fileName, fileSize, mime);

		let id: string = result.id;
		let dc_id: string = result.dc_id;
		let upload_url: string = result.upload_url;
		let access_hash_send: string = result.access_hash_send;
		let totalParts: number = Math.ceil(fileSize / chunkSize);

		const stream = fs.createReadStream(filePath, { highWaterMark: chunkSize });

		let index = 0;

		for await (const chunk of stream) {
			try {
				const res = await undiciRequest(upload_url, {
					method: 'POST',
					headers: {
						auth: this.client.auth,
						'file-id': id,
						'total-part': totalParts.toString(),
						'part-number': (index + 1).toString(),
						'chunk-size': chunk.length.toString(),
						'access-hash-send': access_hash_send,
					},
					body: chunk,
					dispatcher: this.agent,
				});

				const response: any = await res.body.json();

				if (response.status === 'ERROR_TRY_AGAIN') {
					console.log('Retrying upload...');
					stream.close();
					result = await this.client.requestSendFile(fileName, fileSize, mime);
					id = result.id;
					dc_id = result.dc_id;
					upload_url = result.upload_url;
					access_hash_send = result.access_hash_send;
					index = 0;

					return this.uploadFile(filePath, chunkSize);
				}

				index++;

				if (
					response.status === 'OK' &&
					response.status_det === 'OK' &&
					response.data?.access_hash_rec
				) {
					return {
						mime,
						size: fileSize,
						dc_id,
						file_id: id,
						file_name: fileName,
						access_hash_rec: response.data.access_hash_rec,
					};
				}
			} catch (error) {
				console.error('Upload error:', error);
				await new Promise((resolve) => setTimeout(resolve, 5000));
			}
		}

		throw new Error('Upload failed completely.');
	}

	// async download(
	// 	dc_id: number,
	// 	file_id: number,
	// 	access_hash: string,
	// 	size: number,
	// 	chunk: number = 131072,
	// 	callback?: (totalSize: number, downloadedSize: number) => Promise<void>,
	// 	speed: boolean = false
	//   ): Promise<Buffer> {
	// 	const headers = {
	// 	  auth: this.client.auth,
	// 	  "access-hash-rec": access_hash,
	// 	  "file-id": String(file_id),
	// 	  "user-agent": this.userAgent,
	// 	};

	// 	const base_url = `https://messenger${dc_id}.iranlms.ir`;

	// 	const fetchChunk = async (
	// 	  start_index: number,
	// 	  last_index: number
	// 	): Promise<Buffer> => {
	// 	  const chunk_headers = {
	// 		...headers,
	// 		"start-index": String(start_index),
	// 		"last-index": String(last_index),
	// 	  };
	// 	  try {
	// 		const config: AxiosRequestConfig = {
	// 		  headers: chunk_headers,
	// 		  responseType: "arraybuffer",
	// 		};
	// 		const response = await axios.post(
	// 		  `${base_url}/GetFile.ashx`,
	// 		  {},
	// 		  config
	// 		);
	// 		return Buffer.from(response.data);
	// 	  } catch (e) {
	// 		return Buffer.alloc(0);
	// 	  }
	// 	};

	// 	if (speed) {
	// 	  const tasks: Promise<Buffer>[] = [];
	// 	  for (let start_index = 0; start_index < size; start_index += chunk) {
	// 		const last_index = Math.min(start_index + chunk, size) - 1;
	// 		tasks.push(fetchChunk(start_index, last_index));
	// 	  }

	// 	  const resultChunks = await Promise.all(tasks);
	// 	  const result = Buffer.concat(resultChunks);

	// 	  if (callback) {
	// 		await callback(size, result.length);
	// 	  }

	// 	  return result;
	// 	} else {
	// 	  let result = Buffer.alloc(0);
	// 	  let start_index = 0;

	// 	  while (start_index < size) {
	// 		const last_index = Math.min(start_index + chunk, size) - 1;
	// 		const data = await fetchChunk(start_index, last_index);
	// 		if (data.length === 0) break;

	// 		result = Buffer.concat([result, data]);
	// 		start_index = last_index + 1;

	// 		if (callback) {
	// 		  await callback(size, result.length);
	// 		}
	// 	  }

	// 	  return result;
	// 	}
	//   }

	/**
	 * Delay utility
	 */
	public delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Resolves platform configuration based on input
	 */
	private resolvePlatform(
		platform: ClientTypes.PlatformType,
	): NetworkTypes.Platform {
		const isAndroid = platform?.toLowerCase() === 'android';

		return {
			app_name: 'Main',
			app_version: isAndroid ? '3.6.4' : '4.4.9',
			platform: isAndroid ? 'Android' : 'Web',
			package: isAndroid ? 'app.rbmain.a' : 'web.rubika.ir',
			lang_code: 'fa',
		};
	}

	/**
	 * Builds HTTP headers based on platform
	 */
	private buildHeaders(
		platform: ClientTypes.PlatformType,
	): Record<string, string> {
		const headers: Record<string, string> = {
			'content-type': 'application/json',
			connection: 'keep-alive',
			'user-agent': new UserAgent().toString(),
		};
		if (platform.toLowerCase() !== 'android') {
			headers.origin = 'https://web.rubika.ir';
			headers.referer = 'https://web.rubika.ir/';
		}

		return headers;
	}
}
