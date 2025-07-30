import Client from "../../client";

type AccessType =
  | "SetAdmin"
  | "BanMember"
  | "ChangeInfo"
  | "PinMessages"
  | "SetJoinLink"
  | "SetMemberAccess"
  | "DeleteGlobalAllMessages";

type ActionType = "SetAdmin" | "UnsetAdmin";

async function setGroupAdmin(
  this: Client,
  group_guid: string,
  member_guid: string,
  action: ActionType,
  access_list: AccessType[]
) {
  if (!["SetAdmin", "UnsetAdmin"].includes(action)) {
    console.warn(
      `${action} argument can only be in ["SetAdmin", "UnsetAdmin"]. Using default "SetAdmin".`
    );
    action = "SetAdmin"
  }

  if (typeof access_list === "string") access_list = [access_list];

  return await this.builder("setGroupAdmin", {
    group_guid,
    member_guid,
    action,
    access_list,
  });
}

export default setGroupAdmin;
