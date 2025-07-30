import fs from 'fs';
import crypto from 'crypto';
import { ClientTypes, SessionTypes } from '../core/client/types/index.type';
import { BotSession } from '../core/client/types/session.type';

class SessionManager {
	private readonly secretKey: Buffer;
	private readonly filename: string;
	private sessionData?: ClientTypes.Session;

	constructor(
		input: ClientTypes.SessionType,
		private secret: string = '12345678901234567890123456789012',
		private type: 'CLIENT' | 'BOT',
	) {
		this.secretKey = Buffer.from(this.secret);

		const isStringInput = typeof input === 'string';
		const isBotType = type === 'BOT';

		this.filename =
			!isBotType && isStringInput
				? `${input}.json`
				: `${Date.now()}.rubjs.json`;
		
		if (isBotType && isStringInput) {
			const iv = crypto.randomBytes(16);
			
			this.sessionData = {
				enData: this.encrypt({ token: input } as BotSession, iv),
				iv: iv.toString('hex'),
			};
		}

		// console.log(this.filename);
		

		if (!isStringInput) {
			this.sessionData = input;
		}
	}

	private encrypt(sessionData: SessionTypes.SessionData, iv: Buffer): string {
		const cipher = crypto.createCipheriv('aes-256-cbc', this.secretKey, iv);
		let encrypted = cipher.update(JSON.stringify(sessionData), 'utf8', 'hex');
		encrypted += cipher.final('hex');
		return encrypted;
	}

	private decrypt(encryptedData: string, iv: Buffer): SessionTypes.SessionData {
		const decipher = crypto.createDecipheriv('aes-256-cbc', this.secretKey, iv);
		let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return JSON.parse(decrypted);
	}

	public saveSession(sessionData: SessionTypes.SessionData): void {
		const iv = crypto.randomBytes(16);
		const encryptedData = this.encrypt(sessionData, iv);

		const payload = {
			iv: iv.toString('hex'),
			enData: encryptedData,
		};

		fs.writeFileSync(this.filename, JSON.stringify(payload, null, 2));
	}

	public getSession(): SessionTypes.SessionData | null {
		try {
			if (this.sessionData) {
				return this.decrypt(
					this.sessionData.enData,
					Buffer.from(this.sessionData.iv, 'hex'),
				);
			}

			if (!fs.existsSync(this.filename)) {
				const defaultSession: SessionTypes.SessionData =
					this.type === 'CLIENT'
						? {
								phone: '',
								auth: '',
								guid: '',
								agent: '',
								private_key: '',
							}
						: { token: '' };

				this.saveSession(defaultSession);
				return defaultSession;
			}

			const raw = fs.readFileSync(this.filename, 'utf8');
			const parsed = JSON.parse(raw);
			const iv = Buffer.from(parsed.iv, 'hex');

			return this.decrypt(parsed.enData, iv);
		} catch (error) {
			console.error('[SessionManager] Failed to load session:', error);
			return null;
		}
	}
}

export default SessionManager;
