import Client from "../..";

async function getGroupDefaultAccess(this: Client, group_guid: string) {
  return await this.builder("getGroupDefaultAccess", { group_guid });
}

export default getGroupDefaultAccess;
