import Client from "../..";

async function removeGroup(this: Client, group_guid: string) {
  return await this.builder("removeGroup", { group_guid });
}

export default removeGroup;
