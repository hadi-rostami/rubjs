import Message from './contexts/update.context';
import ClientFilters from '../client/filters';

export default class BotFilters {
	static isText(message: Message): boolean {
		return !!ClientFilters.findKey(message, 'text');
	}

	static isLocation(message: Message): boolean {
		return !!ClientFilters.findKey(message, 'location');
	}

	static isSticker(message: Message): boolean {
		return !!ClientFilters.findKey(message, 'sticker');
	}

	static isForward(message: Message): boolean {
		return !!ClientFilters.findKey(message, 'forwarded_from');
	}

	static isReply(message: Message): boolean {
		return !!ClientFilters.findKey(message, 'reply_to_message_id');
	}

	static isContact(message: Message): boolean {
		return !!ClientFilters.findKey(message, 'contact_message');
	}

	static isPoll(message: Message): boolean {
		return !!ClientFilters.findKey(message, 'poll');
	}

	static isLiveLocation(message: Message): boolean {
		return !!ClientFilters.findKey(message, 'live_location');
	}

	static isFile(message: Message): boolean {
		return !!ClientFilters.findKey(message, 'file');
	}

	static isDelete(message: Message): boolean {
		return !!ClientFilters.findKey(message, 'removed_message_id');
	}

	static kypadID(button_id: string): (message: Message) => boolean {
		return (message: Message) => {
			const res = ClientFilters.findKey(message, 'button_id');
			return res === button_id;
		};
	}
}
