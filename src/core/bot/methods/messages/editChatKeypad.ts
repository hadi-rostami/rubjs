import Bot from '../../bot';
import { ChatKeypadTypeEnum, Keypad } from '../../types/models';

type DataType = {
	chat_id: string;
	text: string;
	chat_keypad_type: string;
	chat_keypad?: Keypad;
};

async function editChatKeypad(
	this: Bot,
	chat_id: string,
	text: string,
	chat_keypad?: Keypad,
	chat_keypad_type: ChatKeypadTypeEnum = ChatKeypadTypeEnum.New,
) {
	const data: DataType = {
		chat_id,
		text,
		chat_keypad_type,
	};

	if (chat_keypad) data.chat_keypad = chat_keypad;

	return await this.builder('editChatKeypad', data);
}

export default editChatKeypad;
