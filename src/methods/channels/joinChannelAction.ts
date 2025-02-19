import Client from "../..";

async function joinChannelAction(
  this: Client,
  channel_guid: string,
  action: "Join" | "Remove" | "Archive" = "Join"
) {
  if (!["Join", "Remove", "Archive"].includes(action))
    throw new Error(
      'The `action` argument can only be in `["Join", "Remove", "Archive"]`.'
    );

  return await this.builder("joinChannelAction", { channel_guid, action });
}

export default joinChannelAction;
