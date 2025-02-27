import Client from "../..";

async function setActionChat(
  this: Client,
  object_guid: string,
  action: "Mute" | "Unmute"
) {
  if (["Mute", "Unmute"].includes(action))
    throw new Error('`action` argument can only be in `["Mute", "Unmute"]`');

  return await this.builder("setActionChat", { object_guid, action });
}

export default setActionChat;
