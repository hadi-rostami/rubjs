import { Client } from '..';
import { DecoratorsTypes } from './index.type';

class Notifications implements DecoratorsTypes.ShowNotifications {
	notification_id: string;
	type: string;
	title: string;
	text: string;
	image_file_id?: number;
	message_data: DecoratorsTypes.MessageData;
	store: Record<string, any> = {};

	declare client: Client;

	constructor(client: Client, update: DecoratorsTypes.ShowNotifications) {
		Object.defineProperty(this, 'client', {
			value: client,
			enumerable: false,
			writable: true,
			configurable: true,
		});

		this.notification_id = update.notification_id;
		this.type = update.type;
		this.title = update.title;
		this.text = update.text;
		this.image_file_id = update.image_file_id;
		this.message_data = update.message_data;
	}
}

export default Notifications;
