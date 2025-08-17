import fs from 'fs';
import Bot from '../../bot';
import Update from '../../contexts/update.context';
import { UpdateTypeEnum } from '../../types/models';
import { checkFilters } from '../../../../utils/checkFilters';

const checkTypes = [UpdateTypeEnum.UpdatedMessage, UpdateTypeEnum.NewMessage];

export default async function polling(this: Bot) {
	console.log('start robot with polling mode...');

	let next_offset_id: string | undefined = loadOffset();

	setInterval(async () => {
		try {
			const res = await this.getUpdates(next_offset_id);

			for (let m of res.updates) {
				if (isNaN(m.new_message?.time || m.updated_message?.time)) continue;

				const messageTime =
					Number(m.new_message?.time || m.updated_message?.time) | 0;
				const nowTime = Math.floor(Date.now() / 1000);

				if (nowTime - messageTime < 5) {
					for (let { prefix, filters, handler } of this.handlers.update) {
						const ctx = new Update(this, m);					
						const passed = await checkFilters(ctx, filters);

						if (passed) {
							if (prefix) {
								if (!checkTypes.includes(ctx.type)) continue;

								const text =
									ctx.updated_message?.text || ctx.new_message?.text || '';

								if (typeof prefix === 'string' && text !== prefix) continue;
								if (prefix instanceof RegExp && !prefix.test(text)) continue;
							}

							await handler(ctx);
						}
					}
				}
			}

			if (res.next_offset_id) {
				next_offset_id = res.next_offset_id;
				saveOffset(next_offset_id as string);
			}
		} catch (e) {
			console.error('Error occurred while polling:', e);
		}
	}, 1000);
}

function saveOffset(offset: string) {
	fs.writeFileSync('offset.json', JSON.stringify({ offset }));
}

function loadOffset(): string | undefined {
	if (!fs.existsSync('offset.json')) return undefined;
	const data = fs.readFileSync('offset.json', 'utf8');
	return JSON.parse(data).offset;
}
