import Client from "../..";

async function getObjectInfoByUsername(this: Client, username: string) {
  return await this.builder("getObjectInfoByUsername", {
    username: username.replace("@", ""),
  });
}

export default getObjectInfoByUsername;
