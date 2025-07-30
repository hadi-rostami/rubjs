const { Bot, BotFilters } = require('rubjs');
const { ButtonTypeEnum } = require('rubjs/core/bot/types/models');

const bot = new Bot('YOUR_BOT_TOKEN');

bot.command('/start', async (ctx) => {
	await ctx.reply('hello world.', undefined, {
		rows: [
			{
				buttons: [
					{
						button_text: 'setting',
						id: 'setting',
						type: ButtonTypeEnum.Simple,
					},

					{
						button_text: 'info',
						id: 'info',
						type: ButtonTypeEnum.Simple,
					},
				],
			},
		],
	});
});

bot.on('inline', [BotFilters.kypadID('setting')], async (ctx) => {
	await ctx.reply('setting bot');
});

bot.on('inline', [BotFilters.kypadID('info')], async (ctx) => {
	await ctx.reply('your info');
});

bot.run();
