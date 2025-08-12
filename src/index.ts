// client
import Client from './core/client/client';
import ClientFilters from './core/client/filters';
import ClientUtils from './utils/utils';

// robot
import Bot from './core/bot/bot';
import BotFilters from './core/bot/filters';

// types
import type { RubPlugin } from './core/client/types/client.type';
import type MessageType from './core/client/contexts/message.type';
import type ActivitiesType from './core/client/contexts/activities.type';
import type ChatType from './core/client/contexts/chat.type';
import type NotificationsType from './core/client/contexts/notifications.type';

import type InlineMessageType from './core/bot/contexts/inline.context';
import type UpdateType from './core/bot/contexts/update.context';

import * as Clients from './clients';

// export مقادیر runtime
export { Client, ClientFilters, ClientUtils, Bot, BotFilters, Clients };

// export تایپ‌ها
export type {
	ChatType,
	MessageType,
	ActivitiesType,
	NotificationsType,
	RubPlugin,
	InlineMessageType,
	UpdateType,
};

// export default
export default Client;
