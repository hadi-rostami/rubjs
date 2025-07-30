// import fs from 'fs';
// import Network from '.';
// import Message from '../contexts/message.context';


// export default async function polling(network: Network) {
// 	console.log('start robot with polling mode...');

// 	let next_offset_id: string | undefined = loadOffset();

// 	setInterval(async () => {
// 		try {
// 			const res = await network.bot.getUpdates(next_offset_id);

// 			for (let m of res.updates) {
// 				if (isNaN(m.new_message?.time || m.updated_message?.time)) continue;

// 				const messageTime =
// 					Number(m.new_message?.time || m.updated_message?.time) | 0;
// 				const nowTime = Math.floor(Date.now() / 1000);

// 				if (nowTime - messageTime < 5) {
// 					m = new Message(network.bot, m);

// 					for (let handler of network.bot.handlers) {
// 						if (
// 							handler.filters.length === 0 ||
// 							handler.filters.every((filter) => filter(m))
// 						) {
// 							await handler.handler(m);
// 						}
// 					}
// 				}
// 			}

// 			if (res.next_offset_id) {
// 				next_offset_id = res.next_offset_id;
// 				saveOffset(next_offset_id as string);
// 			}
// 		} catch (e) {
// 			console.error('Error occurred while polling:', e);
// 		}
// 	}, 1000);
// }


// function saveOffset(offset: string) {
// 	fs.writeFileSync('offset.json', JSON.stringify({ offset }));
// }

// function loadOffset(): string | undefined {
// 	if (!fs.existsSync('offset.json')) return undefined;
// 	const data = fs.readFileSync('offset.json', 'utf8');
// 	return JSON.parse(data).offset;
// }
