import { FastifyReply, FastifyRequest } from 'fastify';
import Bot from '../../bot';
import Message from '../../contexts/message.context';
import InlineMessage from '../../contexts/inline.context';
import { UpdateTypeEnum } from '../../types/models';
import { checkFilters } from '../../../../utils/checkFilters';

const checkTypes = [UpdateTypeEnum.UpdatedMessage, UpdateTypeEnum.NewMessage];

async function handleUpdates(
	this: Bot,
	req: FastifyRequest,
	res: FastifyReply,
) {
	const data: any = req.body;

	if (data?.update) {
		for (let { prefix, filters, handler } of this.handlers.message) {
			const ctx = new Message(this, data.update);
			const passed = await checkFilters(ctx, filters);

			if (passed) {
				if (prefix) {
					if (!checkTypes.includes(ctx.type)) continue;

					const text = ctx.updated_message?.text || ctx.new_message?.text || '';

					if (typeof prefix === 'string' && text !== prefix) continue;
					if (prefix instanceof RegExp && !prefix.test(text)) continue;
				}

				await handler(ctx);
			}
		}
	} else if (data?.inline_message) {
		for (let { filters, handler } of this.handlers.inline) {
			const ctx = new InlineMessage(this, data.inline_message);
			const passed = await checkFilters(ctx, filters);

			if (passed) await handler(ctx);
		}
	}

	return res.code(200).send({ status: 'OK' });
}

export default handleUpdates;
