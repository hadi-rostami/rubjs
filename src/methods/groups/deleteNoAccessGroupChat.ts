import Client from "../..";

async function deleteNoAccessGroupChat(this: Client, group_guid: string) {
  return await this.builder("deleteNoAccessGroupChat", { group_guid });
}

export default deleteNoAccessGroupChat;
