import Bot from '../../bot';
import { InlineKeypad } from '../../types/models';

async function editMessageKeypad(
	this: Bot,
	chat_id: string,
	text: string,
	inline_keypad?: InlineKeypad,
) {
	const data = {
		chat_id,
		text,
		inline_keypad,
	};

	return await this.builder('editMessageKeypad', data);
}

export default editMessageKeypad;
