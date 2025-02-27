import Client from "../..";

async function getJoinRequests(this: Client, object_guid: string) {
  return await this.builder("getJoinRequests", { object_guid });
}

export default getJoinRequests;
