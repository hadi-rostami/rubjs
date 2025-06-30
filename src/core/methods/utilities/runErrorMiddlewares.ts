import Client from '../../client';

async function runErrorMiddlewares(
	this: Client,
	error: unknown,
	data: any,
): Promise<void> {
	for (const errMw of this.errorMiddlewares) {
		try {
			await errMw(error, data, async () => {});
		} catch (innerErr) {
			console.error('[ErrorMiddleware] Error inside error handler:', innerErr);
		}
	}
}

export default runErrorMiddlewares;
