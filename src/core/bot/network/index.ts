import Bot from '../bot';
import { Agent, request as undiciRequest } from 'undici';
import JSONbigFactory from 'json-bigint';
const JSONbig = JSONbigFactory({ storeAsString: true });

export default class Network {
	public agent: Agent;

	constructor(public bot: Bot) {
		this.agent = new Agent({
			connect: { rejectUnauthorized: false },
		});
	}

	async request(method: string, data: any) {
		const MAX_ATTEMPTS = 3;

		for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
			try {
				const res = await undiciRequest(
					`${this.bot.BASE_URL}/${this.bot.sendToken}/${method}`,
					{
						method: 'POST',
						headers: {
							'content-type': 'application/json',
						},
						body: JSON.stringify(data),
						dispatcher: this.agent,
					},
				);

				if (res.statusCode === 200) {
					const responseData = await res.body.text();
					const data = JSONbig.parse(responseData);

					return JSON.parse(JSON.stringify(data));
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

		throw new Error(
			`[request] Failed after ${MAX_ATTEMPTS} attempts: ${method}`,
		);
	}

	delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
