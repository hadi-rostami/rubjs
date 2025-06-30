import { Client } from '..';
import { DecoratorsTypes } from './index.type';

class Activities implements DecoratorsTypes.ShowActivities {
	type: string;
	object_guid: string;
	object_type: string;
	user_activity_guid: string;
	store: Record<string, any> = {};

	declare client: Client;

	constructor(client: Client, update: DecoratorsTypes.ShowActivities) {
		Object.defineProperty(this, 'client', {
			value: client,
			enumerable: false,
			writable: true,
			configurable: true,
		});

		this.type = update.type;
		this.object_guid = update.object_guid;
		this.object_type = update.object_type;
		this.user_activity_guid = update.user_activity_guid;
	}
}

export default Activities;
