import Client from "../..";

async function removeFromTopChatUsers(this: Client, user_guid: string) {
  return await this.builder("removeFromTopChatUsers", { user_guid });
}

export default removeFromTopChatUsers;
