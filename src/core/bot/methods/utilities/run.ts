import Bot from '../../bot';
import { UpdateEndpointTypeEnum } from '../../types/models';

async function run(
	this: Bot,
	url?: string,
	host?: string,
	port: number = 3000,
	updates: UpdateEndpointTypeEnum[] = [
		UpdateEndpointTypeEnum.ReceiveInlineMessage,
		UpdateEndpointTypeEnum.ReceiveUpdate,
	],
) {
	while (!this.initialize) {
		await this.network.delay(2000);
	}

	await this.setupWebhook(url, host, port, updates);
}

export default run;
