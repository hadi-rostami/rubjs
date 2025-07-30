import Bot from '../../bot';
import JSONbigFactory from 'json-bigint';
import handleUpdates from './handleUpdates';
import { UpdateEndpointTypeEnum } from '../../types/models';
import { ContentTypeParserDoneFunction } from 'fastify/types/content-type-parser';
import localtunnel from 'localtunnel';

const JSONbig = JSONbigFactory({ storeAsString: true });

function handleParser(
	_: any,
	body: string | Buffer,
	done: ContentTypeParserDoneFunction,
) {
	try {
		const json = JSONbig.parse(body.toString());
		done(null, JSON.parse(JSON.stringify(json)));
	} catch (err) {
		done(err as Error, undefined);
	}
}

async function manageTunnelWithWebhook(
	this: Bot,
	port: number,
	updates: UpdateEndpointTypeEnum[],
	url?: string,
) {
	const setEndpoints = async (url: string) => {
		for (let update of updates) {
			const res = await this.updateBotEndpoints(url, update);

			if (res.status != 'Done')
				console.error(
					`[ manageTunnelWithWebhook ] status updateBotEndpoints is ${res.status} for update: ${update}`,
				);
		}

		console.log('start robot...');
	};

	if (url) {
		return await setEndpoints(url);
	}

	while (true) {
		try {
			const tunnel = await localtunnel({ port });

			await setEndpoints(tunnel.url);

			await new Promise<void>((resolve) => tunnel.on('close', resolve));

			console.warn('🚪 Tunnel closed. Reconnecting...');
		} catch (err) {
			console.error('❌ Tunnel failed:', err);
			await new Promise((r) => setTimeout(r, 3000));
		}
	}
}

function lowerFirstChar(str: string) {
	return str.charAt(0).toLowerCase() + str.slice(1);
}

async function setupWebhook(
	this: Bot,
	url?: string,
	host: string = '0.0.0.0',
	port: number = 3000,
	updates: UpdateEndpointTypeEnum[] = [],
) {
	this.server.addContentTypeParser(
		'application/json',
		{ parseAs: 'string' },
		handleParser,
	);

	this.server.get('/', handleUpdates.bind(this));

	this.server.post('/', handleUpdates.bind(this));

	for (let update of updates) {
		this.server.post(`/${lowerFirstChar(update)}`, handleUpdates.bind(this));
	}

	await this.server.listen({ port, host });

	await manageTunnelWithWebhook.bind(this)(port, updates, url);
}

export default setupWebhook;
