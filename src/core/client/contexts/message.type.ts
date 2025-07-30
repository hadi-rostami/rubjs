import { Client } from '../../..';
import { DecoratorsTypes } from '../types/index.type';

const getOriginalType = (message: any) => {
	try {
		if (!message?.message?.type) return 'Delete';

		if (message.message.type.includes('FileInline')) {
			return message.message.file_inline?.type;
		}
		if (message.message.type === 'Event') {
			return message.message.event_data.type;
		}
		return message.message.type;
	} catch (e) {
		console.log(e, message);
	}
};


class Message implements DecoratorsTypes.MessageUpdate {
	message_id: string;
	action: string;
	message: DecoratorsTypes.Message;
	updated_parameters: any[];
	timestamp: string;
	prev_message_id: string;
	object_guid: string;
	type: string;
	state: string;
	client_guid: string;
	store: Record<string, any> = {};

	declare client: Client;
	declare originalType: string;

	constructor(client: Client, update: DecoratorsTypes.MessageUpdate) {
		Object.defineProperty(this, 'client', {
			value: client,
			enumerable: false,
			writable: true,
			configurable: true,
		});

		Object.defineProperty(this, 'originalType', {
			value: getOriginalType(update),
			enumerable: false,
			writable: true,
			configurable: true,
		});

		this.client_guid = update.client_guid;
		this.message_id = update.message_id;
		this.action = update.action;
		this.message = update.message;
		this.updated_parameters = update.updated_parameters;
		this.timestamp = update.timestamp;
		this.prev_message_id = update.prev_message_id;
		this.object_guid = update.object_guid;
		this.type = update.type;
		this.state = update.state;
	}

	async reply(
		text?: string,
		object_guid?: string,
		message_id?: string,
		auto_delete?: number,
		file_inline?: string | Buffer<ArrayBufferLike>,
		type?: string,
		is_spoil?: boolean,
		thumb?: string,
		audio_info?: boolean,
	) {
		return await this.client.sendMessage(
			object_guid || this.object_guid,
			text,
			message_id || this.message_id,
			file_inline,
			type,
			is_spoil,
			thumb,
			audio_info,
			auto_delete,
		);
	}

	async pin(
		object_guid?: string,
		message_id?: string,
		action: 'Pin' | 'Unpin' = 'Pin',
	) {
		return await this.client.setPinMessage(
			object_guid || this.object_guid,
			message_id || this.message_id,
			action,
		);
	}

	async reply_photo(
		photo: string | Buffer<ArrayBufferLike>,
		caption?: string,
		object_guid?: string,
		auto_delete?: number,
		reply_to_message_id?: string,
		is_spoil?: boolean,
		thumb?: string,
	) {
		return await this.reply(
			caption,
			object_guid,
			reply_to_message_id,
			auto_delete,
			photo,
			'Image',
			is_spoil,
			thumb,
		);
	}

	async forward(to_object_guid: string) {
		return await this.client.forwardMessages(this.object_guid, to_object_guid, [
			this.message_id,
		]);
	}

	async delete() {
		return await this.client.deleteMessages(this.object_guid, [
			this.message_id,
		]);
	}

	async reaction(
		reaction_id: number,
		object_guid?: string,
		message_id?: string,
		action: 'Add' | 'Remove' = 'Add',
	) {
		return await this.client.actionOnMessageReaction(
			object_guid || this.object_guid,
			message_id || this.message_id,
			reaction_id,
			action,
		);
	}

	async getReplyMessage(object_guid?: string, message_id?: string) {
		const result = await this.client.getMessagesByID(
			object_guid || this.object_guid,
			message_id || [this.message.reply_to_message_id],
		);

		return result.messages[0];
	}
}

export default Message;
