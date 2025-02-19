import Client from "../..";

async function createChannelVoiceChat(this: Client, channel_guid: string) {
  return await this.builder("createChannelVoiceChat", { channel_guid });
}

export default createChannelVoiceChat;
