import Bot from '../../bot';
import { BotSession } from '../../../client/types/session.type';
import prompt from '../../../../utils/prompt';

async function start(this: Bot, token?: string) {
	if (!token) {
		const DB = this.sessionDB.getSession() as BotSession | null;
		
		if (DB) {
			this.sendToken = DB.token;
		}
	} else {
		this.sendToken = token;
	}

	try {
		const res = await this.getMe();
		this.bot = res.bot;
	} catch {
		const token = await prompt('[start] Please enter your bot token: ');
		await this.start(token);
	}

	this.initialize = true;
}

export default start;
