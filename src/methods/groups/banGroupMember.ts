import Client from "../..";

async function banGroupMember(
  this: Client,
  group_guid: string,
  member_guid: string,
  action: "Set" | "Unset" = "Set"
) {
  if (!["Set", "Unset"].includes(action))
    throw new Error(`${action} argument can only be in ["Set", "Unset"].`);

  return await this.builder("banGroupMember", {
    group_guid,
    member_guid,
    action,
  });
}

export default banGroupMember;
