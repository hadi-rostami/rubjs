import Client from "../..";

async function joinGroup(this: Client, link: string) {
  if (link.includes("/")) link = link.split("/")[-1];
  return await this.builder("joinGroup", { hash_link: link });
}

export default joinGroup;
