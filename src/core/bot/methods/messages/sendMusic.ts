import Bot from '../../bot';
import {
	ChatKeypadTypeEnum,
	FileTypeEnum,
	InlineKeypad,
	Keypad,
} from '../../types/models';

async function sendMusic(
	this: Bot,
	chat_id: string,
	path_file: string,
	text?: string,
	chat_keypad?: Keypad,
	inline_keypad?: InlineKeypad,
	disable_notification = false,
	reply_to_message_id?: string,
	chat_keypad_type?: ChatKeypadTypeEnum,
) {
	return await this._sendFile(
		chat_id,
		path_file,
		text,
		FileTypeEnum.Music,
		chat_keypad,
		inline_keypad,
		disable_notification,
		reply_to_message_id,
		chat_keypad_type,
	);
}

export default sendMusic;
