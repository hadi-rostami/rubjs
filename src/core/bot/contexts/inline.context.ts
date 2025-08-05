import { Bot } from '../../..';
import {
	File,
	Location,
	AuxData,
	InlineMessage as InlineMessageType,
	Keypad,
	ChatKeypadTypeEnum,
	InlineKeypad,
} from '../types/models';

class InlineMessage implements InlineMessageType {
	public sender_id: string;
	public text: string;
	public file?: File;
	public location?: Location;
	public aux_data?: AuxData;
	public message_id: string;
	public chat_id: string;

	public store: Record<string, any> = {};

	declare bot: Bot;

	constructor(bot: Bot, update: InlineMessageType) {
		Object.defineProperty(this, 'bot', {
			value: bot,
			enumerable: false,
			writable: true,
			configurable: true,
		});

		this.chat_id = update.chat_id;
		this.sender_id = update.sender_id;
		this.text = update.text;
		if (update?.file) this.file = update.file;
		if (update?.location) this.location = update.location;
		if (update?.aux_data) this.aux_data = update.aux_data;

		this.message_id = update.message_id;
	}

	async reply(
		text: string,
		chat_keypad?: Keypad,
		inline_keypad?: InlineKeypad,
		disable_notification = false,
		reply_to_message_id?: string,
		chat_keypad_type?: ChatKeypadTypeEnum,
	) {
		return await this.bot.sendMessage(
			this.chat_id,
			text,
			chat_keypad,
			inline_keypad,
			disable_notification,
			reply_to_message_id,
			chat_keypad_type,
		);
	}
}

export default InlineMessage;
