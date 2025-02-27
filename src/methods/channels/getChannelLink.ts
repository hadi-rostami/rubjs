import Client from "../..";

async function getChannelLink(this: Client, channel_guid: string) {
  return await this.builder("getChannelLink", { channel_guid });
}

export default getChannelLink;
