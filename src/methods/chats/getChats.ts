import Client from "../..";

async function getChats(this: Client, start_id: string) {
  return await this.builder("getChats", { start_id });
}

export default getChats;
