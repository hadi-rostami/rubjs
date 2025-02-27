import Client from "../..";

async function getProfileLinkItems(this: Client, object_guid: string) {
  return await this.builder("getProfileLinkItems", { object_guid });
}

export default getProfileLinkItems;
