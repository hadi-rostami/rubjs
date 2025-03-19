import Client from "../..";

async function createGroupVoiceChat(this: Client, chat_guid: string) {
  return await this.builder("createGroupVoiceChat", { chat_guid });
}

export default createGroupVoiceChat;
