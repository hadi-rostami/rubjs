import Client from "../../client";

async function banMember(
  this: Client,
  object_guid: string,
  member_guid: string
) {
  if (object_guid.startsWith("g0"))
    return await this.banGroupMember(object_guid, member_guid);
  
  else if (object_guid.startsWith("c0"))
    return await this.banChannelMember(object_guid, member_guid);
}

export default banMember;
