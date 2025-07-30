import Bot from '../../bot';

async function getChat(this: Bot, chat_id: string) {
	return await this.builder('getChat', { chat_id });
}

export default getChat;
