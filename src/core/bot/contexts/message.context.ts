import { Bot } from '../../..';
import {
	PaymentStatus,
	Update,
	UpdateTypeEnum,
	Message as MessageUpdate,
	Keypad,
	ChatKeypadTypeEnum,
	InlineKeypad,
} from '../types/models';

class Message implements Update {
	public type: UpdateTypeEnum;
	public chat_id: string;
	public removed_message_id?: string;
	public new_message?: MessageUpdate;
	public updated_message?: MessageUpdate;
	public updated_payment?: PaymentStatus;

	public store: Record<string, any> = {};

	declare bot: Bot;

	constructor(bot: Bot, update: Update) {
		Object.defineProperty(this, 'bot', {
			value: bot,
			enumerable: false,
			writable: true,
			configurable: true,
		});

		this.type = update.type;
		this.chat_id = update.chat_id;
		if (update?.new_message) this.new_message = update?.new_message;
		if (update?.updated_message) this.updated_message = update?.updated_message;
		if (update?.updated_payment) this.updated_payment = update?.updated_payment;

		if (update.removed_message_id)
			this.removed_message_id = update.removed_message_id;
	}

	async reply(
		text: string,
		chat_keypad?: Keypad,
		inline_keypad?: InlineKeypad,
		disable_notification = false,
		reply_to_message_id?: string,
		chat_keypad_type?: ChatKeypadTypeEnum,
	) {
		await this.bot.sendMessage(
			this.chat_id,
			text,
			chat_keypad,
			inline_keypad,
			disable_notification,
			reply_to_message_id,
			chat_keypad_type,
		);
	}

	async forward(to_chat_id: string, disable_notification = false) {
		const message_id =
			this.new_message?.message_id || this.updated_message?.message_id;

		if (!message_id) return;

		await this.bot.forwardMessage(
			this.chat_id,
			message_id,
			to_chat_id,
			disable_notification,
		);
	}

	async delete() {
		const message_id =
			this.new_message?.message_id || this.updated_message?.message_id;

		if (!message_id) return;

		await this.bot.deleteMessage(this.chat_id, message_id);
	}
}

export default Message;
