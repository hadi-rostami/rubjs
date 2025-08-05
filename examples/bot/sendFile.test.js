const { Bot } = require('rubjs');

const bot = new Bot('YOUR_BOT_TOKEN');

bot.command('/file', async (ctx) => {
	const res = await bot.sendFile(ctx.chat_id, './example.txt');

	console.log(res);
});

bot.run();
