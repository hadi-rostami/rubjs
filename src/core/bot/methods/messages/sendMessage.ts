import Bot from '../../bot';
import { ChatKeypadTypeEnum, InlineKeypad, Keypad } from '../../types/models';

async function sendMessage(
	this: Bot,
	chat_id: string,
	text: string,
	chat_keypad?: Keypad,
	inline_keypad?: InlineKeypad,
	disable_notification = false,
	reply_to_message_id?: string,
	chat_keypad_type?: ChatKeypadTypeEnum,
) {
	const data = {
		chat_id,
		text,
		chat_keypad,
		inline_keypad,
		disable_notification,
		reply_to_message_id,
		chat_keypad_type,
	};


	if (chat_keypad && !chat_keypad_type) {
		data.chat_keypad_type = ChatKeypadTypeEnum.New;
	}

	if (inline_keypad && chat_keypad_type) {
		data.chat_keypad_type = ChatKeypadTypeEnum.None;
	}
	
	return await this.builder('sendMessage', data);
}

export default sendMessage;
