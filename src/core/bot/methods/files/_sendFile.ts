import Bot from '../../bot';
import fs from 'fs';
import {
	ChatKeypadTypeEnum,
	FileTypeEnum,
	InlineKeypad,
	Keypad,
} from '../../types/models';

interface SendType {
	chat_id: string;
	file_id: string;
	disable_notification: boolean;
	chat_keypad_type?: ChatKeypadTypeEnum;
	text?: string;
	chat_keypad?: Keypad;
	inline_keypad?: InlineKeypad;
	reply_to_message_id?: string;
}

async function _sendFile(
	this: Bot,
	chat_id: string,
	path_file: string,
	text?: string,
	type: FileTypeEnum = FileTypeEnum.File,
	chat_keypad?: Keypad,
	inline_keypad?: InlineKeypad,
	disable_notification = false,
	reply_to_message_id?: string,
	chat_keypad_type?: ChatKeypadTypeEnum,
) {
	if (!fs.existsSync(path_file)) {
		throw new Error('');
	}

	const { upload_url } = await this.requestSendFile(type);
	const {
		data: { file_id },
	} = await this.uploadFile(upload_url, path_file);

	const data: SendType = {
		chat_id,
		file_id,
		disable_notification,
	};

	if (text) data.text = text;
	if (chat_keypad) data.chat_keypad = chat_keypad;
	if (inline_keypad) data.inline_keypad = inline_keypad;
	if (chat_keypad_type) data.chat_keypad_type = chat_keypad_type;
	if (reply_to_message_id) data.reply_to_message_id = reply_to_message_id;

	if (chat_keypad && !chat_keypad_type) {
		data.chat_keypad_type = ChatKeypadTypeEnum.New;
	}

	if (inline_keypad && chat_keypad_type) {
		data.chat_keypad_type = ChatKeypadTypeEnum.None;
	}

	return await this.builder('sendFile', data);
}

export default _sendFile;
