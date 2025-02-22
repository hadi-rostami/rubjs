<p align="center">
    <br>
    <b>Rubika API Framework for JavaScript</b>
</p>

## RubJS

> Elegant, modern and asynchronous Rubika API framework in JavaScript for users account

### Async Accounts
```javascript
const { Client, Filters } = require("../rubjs");

const bot = new Client("bot");

bot.onMessageUpdates([Filters.is_text], async (message) => {
  await message.reply("Hello From RubJS!!");
});

bot.run();

```

**RubJS** is a modern, elegant and asynchronous framework. It enables you to easily interact with the main Rubika API through a user account (custom client) or a bot
identity (bot API alternative) using JavaScript.


### Key Features

- **Ready**: Install RubJS with npm and start building your applications right away.
- **Easy**: Makes the Rubika API simple and intuitive, while still allowing advanced usages.
- **Elegant**: Low-level details are abstracted and re-presented in a more convenient way.
- **Async**: Fully asynchronous (also usable synchronously if wanted, for convenience).
- **Powerful**: Full access to Rubika's API to execute any official client action and more.

### Installing

``` bash
npm install rubjs
```