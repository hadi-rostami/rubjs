import { Client } from '../../..';
import { DecoratorsTypes } from '../types/index.type';


class Chat implements DecoratorsTypes.ChatUpdates {
	object_guid: string;
	action: string;
	chat: DecoratorsTypes.Chat;
	updated_parameters: string[];
	timestamp: string;
	type: string;
	store: Record<string, any> = {};

	declare client: Client;

	constructor(client: Client, update: DecoratorsTypes.ChatUpdates) {
		Object.defineProperty(this, 'client', {
			value: client,
			enumerable: false,
			writable: true,
			configurable: true,
		});
        
		this.object_guid = update.object_guid;
		this.action = update.action;
		this.chat = update.chat;
		this.updated_parameters = update.updated_parameters;
		this.timestamp = update.timestamp;
		this.type = update.type;
	}
}

export default Chat;
