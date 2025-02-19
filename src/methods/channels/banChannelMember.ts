import Client from "../..";

async function banChannelMember(
  this: Client,
  channel_guid: string,
  member_guid: string,
  action: "Set" | "Unset" = "Set"
) {
  if (!["Set", "Unset"].includes(action))
    throw new Error(`${action} argument can only be in ["Set", "Unset"]`);

  return await this.builder("banChannelMember", {
    channel_guid,
    member_guid,
    action,
  });
}

export default banChannelMember;
