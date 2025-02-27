import Client from "../..";

async function seenChats(this: Client, seen_list: Record<string, any>) {
  return await this.builder("seenChats", { seen_list });
}

export default seenChats;
