import Client from "../..";

type ChatHistory = "Hidden" | "Visible";

interface InputType {
  title?: string;
  channel_guid: string;
  updated_parameters: string[];
  description?: string;
  channel_type?: string;
  sign_messages?: boolean;
  chat_reaction_setting?: {};
  chat_history_for_new_members?: ChatHistory;
}

async function editChannelInfo(
  this: Client,
  channel_guid: string,
  title?: string,
  description?: string,
  channel_type?: string,
  sign_messages?: boolean,
  chat_reaction_setting?: {},
  chat_history_for_new_members?: ChatHistory
) {
  let input: InputType = { channel_guid, updated_parameters: [] };

  if (title) {
    input.title = title;
    input.updated_parameters.push("title");
  }
  if (description) {
    input.description = description;
    input.updated_parameters.push("description");
  }
  if (channel_type) {
    input.channel_type = channel_type;
    input.updated_parameters.push("channel_type");
  }
  if (sign_messages) {
    input.sign_messages = sign_messages;
    input.updated_parameters.push("sign_messages");
  }
  if (chat_reaction_setting) {
    input.chat_reaction_setting = chat_reaction_setting;
    input.updated_parameters.push("chat_reaction_setting");
  }

  if (chat_history_for_new_members) {
    if (!["Hidden", "Visible"].includes(chat_history_for_new_members))
      throw new Error(
        '`chat_history_for_new_members` argument can only be in `["Hidden", "Visible"]`.'
      );

    input.chat_history_for_new_members = chat_history_for_new_members;
    input.updated_parameters.push("chat_history_for_new_members");
  }

  return await this.builder("editChannelInfo", input);
}

export default editChannelInfo;
