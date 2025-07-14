import Client from './core/client';
import Filters from './core/filters';
import Utils from './utils/utils';

import { RubPlugin } from './types/client.type';
import type MessageType from './core/context/message.type';
import type ActivitiesType from './core/context/activities.type';
import type ChatType from './core/context/chat.type';
import type NotificationsType from './core/context/notifications.type';
import * as Clients from './clients';

export {
	Client,
	Filters,
	Utils,

	// types
	RubPlugin,
	ChatType,
	MessageType,
	ActivitiesType,
	NotificationsType,

	// clients
	Clients,
};

export default Client;
