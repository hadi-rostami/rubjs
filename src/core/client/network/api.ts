import { request as undiciRequest } from 'undici';
import Network from '.';
import Crypto from '../crypto';

interface GetDocsResponse {
	data?: {
		API: Record<string, string>;
		socket: Record<string, string>;
		default_api: string;
		default_socket: string;
	};
}

interface SendPayloadInputs {
	input?: Record<string, any>;
	method?: string;
	tmp_session: boolean;
}

/**
 * Retrieves API and WSS server URLs
 */
export async function getDcs(network: Network): Promise<boolean> {
	const url = 'https://getdcmess.iranlms.ir/';
	const RETRY_DELAY = 3000;

	while (true) {
		try {
			const res = await undiciRequest(url, {
				method: 'GET',
				dispatcher: network.agent,
			});

			if (res.statusCode === 200) {
				const body = (await res.body.json()) as GetDocsResponse;

				if (body?.data) {
					const dcs = body.data;
					network.apiUrl = `${dcs.API[dcs.default_api]}/`;
					network.wssUrl = dcs.socket[dcs.default_socket];
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

		await network.delay(RETRY_DELAY);
	}
}

/**
 * Sends a POST request with retry logic and enhanced error reporting
 */
export async function sendRequest(network: Network, url: string, data: any) {
	const MAX_ATTEMPTS = 3;

	for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
		try {
			const res = await undiciRequest(url, {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					...network.headers,
				},
				body: JSON.stringify(data),
				dispatcher: network.agent,
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

		await network.delay(1000);
	}

	throw new Error(`[request] Failed after ${MAX_ATTEMPTS} attempts: ${url}`);
}

export async function sendPayload(
	network: Network,
	datas: SendPayloadInputs,
): Promise<any> {
	await network.getDcs();

	while (!network.apiUrl) {
		await network.delay(1000);
	}

	const { auth, decode_auth, key, privateKey } = network.client;
	if (!key) return;

	const credentialsKey = datas.tmp_session ? 'tmp_session' : 'auth';
	const credentialsValue = datas.tmp_session ? auth : decode_auth;

	const dataPayload = JSON.stringify({
		client: network.defaultPlatform,
		method: datas.method,
		input: datas.input,
	});

	const payload: Record<string, any> = {
		api_version: '6',
		data_enc: Crypto.encrypt(dataPayload, key),
		[credentialsKey]: credentialsValue,
	};

	if (!datas.tmp_session && privateKey) {
		payload.sign = Crypto.sign(payload.data_enc, privateKey);
	}

	return network.request(network.apiUrl, payload);
}
