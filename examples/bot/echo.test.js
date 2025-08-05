const { Bot, BotFilters } = require('rubjs');

const bot = new Bot('YOUR_BOT_TOKEN');

bot.on('message', [BotFilters.isText], async (ctx) => {
	await ctx.reply(ctx.new_message.text);
});

bot.run();
