import Client from "../..";

async function createGroupVoiceChat(this: Client, group_guid: string) {
  return await this.builder("createGroupVoiceChat", { group_guid });
}

export default createGroupVoiceChat;
