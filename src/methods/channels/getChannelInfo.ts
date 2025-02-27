import Client from "../..";

async function getChannelInfo(this: Client, channel_guid: string) {
  return await this.builder("getChannelInfo", { channel_guid });
}

export default getChannelInfo;
