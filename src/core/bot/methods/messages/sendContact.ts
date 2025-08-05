import Bot from '../../bot';
import { ChatKeypadTypeEnum, Keypad } from '../../types/models';

async function sendContact(
	this: Bot,
	chat_id: string,
	first_name: string,
	last_name: string,
	phone_number: string,
	chat_keypad?: Keypad,
	inline_keypad?: Keypad,
	disable_notification = false,
	reply_to_message_id?: string,
	chat_keypad_type?: ChatKeypadTypeEnum,
) {
	const data = {
		chat_id,
		first_name,
		last_name,
		phone_number,
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

	return await this.builder('sendContact', data);
}

export default sendContact;
