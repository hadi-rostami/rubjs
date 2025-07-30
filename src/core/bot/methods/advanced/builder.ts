import Bot from '../../bot';
import { BuilderException, MeaagesErrors } from '../../../../exceptions';

async function builder(
	this: Bot,
	method: string,
	input: object = {},
): Promise<any> {
	if (!this.sendToken) {
		throw new Error(
			'[builder] Bot token is not set. Please provide a valid token.',
		);
	}

	const response: any = await this.network.request(method, input);


	if (response?.status === 'OK') {
		return response.data;
	}

	const msg = `[builder] ${MeaagesErrors[response?.status] || 'unknown error:'}`;
	throw new BuilderException(msg, response?.status, response);
}

export default builder;
