import Crypto from '../core/client/crypto';
import Network from './network_login';
import SessionManager from '../utils/session';

interface AuthResult {
	isOk: boolean;
	status?: string;
	phone_code_hash?: string;
	code_digits_count?: number;
	auth?: string;
	key?: Buffer;
	decode_auth?: string;
	phone_number?: string;
}

interface AuthFace {
	auth: string;
	key: Buffer;
	privateKey: any;
	decode_auth?: string;
}

class LoginClient {
	static systemVersions: Record<string, string> = {
		'Windows NT 10.0': 'Windows 10',
		'Windows NT 6.2': 'Windows 8',
		'Windows NT 6.1': 'Windows 7',
		'Windows NT 6.0': 'Windows Vista',
		'Windows NT 5.1': 'Windows XP',
		'Windows NT 5.0': 'Windows 2000',
		Mac: 'Mac/iOS',
		X11: 'UNIX',
		Linux: 'Linux',
	};

	static async sendCode(
		phone_number: string,
		pass_key?: string,
	): Promise<AuthResult> {
		const network = new Network();

		const data = {
			phone_number,
			pass_key: pass_key || null,
			send_type: 'SMS',
		};
		const result = await network.bulder('sendCode', data, {}, true);

		if (result)
			return {
				isOk: true,
				status: result.status,
				phone_code_hash: result.phone_code_hash,
				code_digits_count: result.code_digits_count,
				auth: result.auth_data,
				key: result.key_data,
				phone_number,
			};

		return {
			isOk: false,
		};
	}

	static async signIn(
		phone_code: string,
		datas: AuthResult,
		sessionPath?: string,
	) {
		if (!datas.auth || !datas.key) return;

		const network = new Network();
		const [publicKey, privateKey] = Crypto.createKeys();

		const data = {
			phone_code,
			phone_number: datas.phone_number,
			phone_code_hash: datas.phone_code_hash,
			public_key: publicKey,
		};

		const auth: AuthFace = {
			auth: datas.auth,
			key: datas.key,
			privateKey,
		};

		const response = await network.bulder('signIn', data, auth, true);

		if (response?.status === 'CodeIsInvalid') {
			return { isOk: false, status: 'CodeIsInvalid' };
		}

		if (!response) return { isOk: false, status: 'CodeIsInvalid' };

		const sampleAuth = Crypto.decrypt_RSA_OAEP(privateKey, response.auth);
		auth.key = Buffer.from(Crypto.passphrase(sampleAuth), 'utf8');
		auth.auth = sampleAuth;
		auth.decode_auth = Crypto.decode_auth(sampleAuth);
		await this.registerDevice(network, auth);

		const sessionData = {
			phone: response.user.phone,
			auth: auth.auth,
			guid: response.user.user_guid,
			agent: network.userAgent,
			private_key: privateKey,
		};

		if (sessionPath) {
			const session = new SessionManager(sessionPath, undefined, 'CLIENT');
			session.saveSession(sessionData);
		}
		return { isOk: true, status: 'Sucessfull', sessionData };
	}

	static async registerDevice(network: Network, datas: AuthFace) {
		const browserData = await this.getBrowser(
			network.userAgent,
			network.defaultPlatform.lang_code,
			network.defaultPlatform.app_version,
		);

		await network.bulder('registerDevice', browserData, datas);
	}

	static async getBrowser(
		userAgent: string,
		langCode: string,
		appVersion: string,
	) {
		const match = userAgent
			.toLowerCase()
			.match(/(opera|chrome|safari|firefox|msie|trident)\/(\d+)/);

		if (!match) {
			throw new Error(`Cannot parse user-agent: ${userAgent}`);
		}

		const deviceModel = `${match[1]} ${match[2]}`;
		const systemVersion =
			Object.entries(this.systemVersions).find(([key]) =>
				userAgent.includes(key),
			)?.[1] || 'Unknown';

		const deviceHash = '2' + (userAgent.match(/\d+/g)?.join('') || '');

		return {
			token: '',
			lang_code: langCode,
			token_type: 'Web',
			app_version: `WB_${appVersion}`,
			system_version: systemVersion,
			device_model: deviceModel.charAt(0).toUpperCase() + deviceModel.slice(1),
			device_hash: deviceHash,
		};
	}
}

export default LoginClient;
