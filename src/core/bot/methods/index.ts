import Bot from '../bot';

// types

import * as BotMethods from './bot';
import * as Advanced from './advanced';
import * as Utilities from './utilities';
import * as Files from './files';
import * as Messages from './messages';
import * as Chat from './chat';
import * as Settings from './settings';

import { SendMessage, Bot as BotType, Chat as ChatType } from '../types/models';

export default class Methods {
	// advanced
	async builder(
		this: Bot,
		...args: Parameters<typeof Advanced.builder>
	): Promise<any> {
		return Advanced.builder.apply(this, args);
	}

	// bot
	async getMe(
		this: Bot,
		...args: Parameters<typeof BotMethods.getMe>
	): Promise<BotType> {
		return BotMethods.getMe.apply(this, args);
	}

	// files
	async getFile(
		this: Bot,
		...args: Parameters<typeof Files.getFile>
	): Promise<any> {
		return Files.getFile.apply(this, args);
	}
	async requestSendFile(
		this: Bot,
		...args: Parameters<typeof Files.requestSendFile>
	): Promise<{ upload_url: string }> {
		return Files.requestSendFile.apply(this, args);
	}
	async uploadFile(
		this: Bot,
		...args: Parameters<typeof Files.uploadFile>
	): Promise<any> {
		return Files.uploadFile.apply(this, args);
	}

	// messages
	async sendMessage(
		this: Bot,
		...args: Parameters<typeof Messages.sendMessage>
	): Promise<SendMessage> {
		return Messages.sendMessage.apply(this, args);
	}

	async sendPoll(
		this: Bot,
		...args: Parameters<typeof Messages.sendPoll>
	): Promise<SendMessage> {
		return Messages.sendPoll.apply(this, args);
	}

	async sendLocation(
		this: Bot,
		...args: Parameters<typeof Messages.sendLocation>
	): Promise<SendMessage> {
		return Messages.sendLocation.apply(this, args);
	}

	async sendContact(
		this: Bot,
		...args: Parameters<typeof Messages.sendContact>
	): Promise<SendMessage> {
		return Messages.sendContact.apply(this, args);
	}

	async forwardMessage(
		this: Bot,
		...args: Parameters<typeof Messages.forwardMessage>
	): Promise<SendMessage> {
		return Messages.forwardMessage.apply(this, args);
	}

	async editMessageText(
		this: Bot,
		...args: Parameters<typeof Messages.editMessageText>
	): Promise<SendMessage> {
		return Messages.editMessageText.apply(this, args);
	}

	async deleteMessage(
		this: Bot,
		...args: Parameters<typeof Messages.deleteMessage>
	): Promise<SendMessage> {
		return Messages.deleteMessage.apply(this, args);
	}

	async editMessageKeypad(
		this: Bot,
		...args: Parameters<typeof Messages.editMessageKeypad>
	): Promise<SendMessage> {
		return Messages.editMessageKeypad.apply(this, args);
	}

	async editChatKeypad(
		this: Bot,
		...args: Parameters<typeof Messages.editChatKeypad>
	): Promise<SendMessage> {
		return Messages.editChatKeypad.apply(this, args);
	}

	// chat
	async getChat(
		this: Bot,
		...args: Parameters<typeof Chat.getChat>
	): Promise<ChatType> {
		return Chat.getChat.apply(this, args);
	}

	// utilities
	async start(
		this: Bot,
		...args: Parameters<typeof Utilities.start>
	): Promise<any> {
		return Utilities.start.apply(this, args);
	}

	async run(
		this: Bot,
		...args: Parameters<typeof Utilities.run>
	): Promise<any> {
		return Utilities.run.apply(this, args);
	}

	async getUpdates(
		this: Bot,
		...args: Parameters<typeof Utilities.getUpdates>
	): Promise<any> {
		return Utilities.getUpdates.apply(this, args);
	}

	async setupWebhook(
		this: Bot,
		...args: Parameters<typeof Utilities.setupWebhook>
	): Promise<any> {
		return Utilities.setupWebhook.apply(this, args);
	}

	// settings
	async setCommands(
		this: Bot,
		...args: Parameters<typeof Settings.setCommands>
	): Promise<any> {
		return Settings.setCommands.apply(this, args);
	}

	async updateBotEndpoints(
		this: Bot,
		...args: Parameters<typeof Settings.updateBotEndpoints>
	): Promise<any> {
		return Settings.updateBotEndpoints.apply(this, args);
	}
}
