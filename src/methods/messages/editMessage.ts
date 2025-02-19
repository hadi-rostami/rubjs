import Client from "../..";

async function editMessage(
  this: Client,
  object_guid: string,
  message_id: string,
  text: string
) {
  const input = {
    object_guid,
    message_id,
    text: text.trim(),
  };

  return await this.builder("editMessage", input);
}

export default editMessage;
