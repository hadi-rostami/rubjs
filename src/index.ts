// client
import Client from './core/client/client';
import ClientFilters from './core/client/filters';
import ClientUtils from './utils/utils';

// robot
import Bot from './core/bot/bot';
import BotFilters from './core/bot/filters';

// types
import { RubPlugin } from './core/client/types/client.type';
import type MessageType from './core/client/contexts/message.type';
import type ActivitiesType from './core/client/contexts/activities.type';
import type ChatType from './core/client/contexts/chat.type';
import type NotificationsType from './core/client/contexts/notifications.type';
import * as Clients from './clients';

export {
	// client
	Client,
	ClientFilters,
	ClientUtils,

	// bot
	Bot,
	BotFilters,
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
