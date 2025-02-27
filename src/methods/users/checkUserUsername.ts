import Client from "../..";

async function checkUserUsername(this: Client, username: string) {
  return await this.builder("checkUserUsername", { username });
}

export default checkUserUsername;
