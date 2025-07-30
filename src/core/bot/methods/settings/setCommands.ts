import Bot from '../../bot';
import { Commend } from '../../types/models';


async function setCommands(this: Bot, commands: Commend[]) {
	return await this.builder('setCommands', { bot_commands: commands });
}

export default setCommands;
