import Client from "../..";

async function getContacts(this: Client, start_id: string) {
  return await this.builder("getContacts", { start_id });
}

export default getContacts;
