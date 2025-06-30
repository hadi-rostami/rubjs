import Client from './core/client';
import Filters from './core/filters';
import Utils from './core/utils';

import { Middleware, RubPlugin } from './types/client.type';
import type MessageType from './types/message.type';
import * as ContextTypes from './types/index.type';
import * as Clients from './clients';

export {
	Client,
	Filters,
	Utils,

	// types
	Middleware,
	MessageType,
	RubPlugin,
	ContextTypes,

	// clients
	Clients,
};

export default Client;
