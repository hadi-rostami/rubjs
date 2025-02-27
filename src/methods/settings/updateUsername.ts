import Client from "../..";

async function updateUsername(this: Client, username: string) {
  return await this.builder("updateUsername", { username });
}

export default updateUsername;
