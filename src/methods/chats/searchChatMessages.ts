import Client from "../..";

async function searchChatMessages(
  this: Client,
  object_guid: string,
  search_text: string,
  type: "Text" | "Hashtag"
) {
  if (!["Text", "Hashtag"].includes(type))
    throw new Error('`type` argument can only be in ("text", "Hashtag").');

  return await this.builder("searchChatMessages", {
    object_guid,
    search_text,
    type,
  });
}

export default searchChatMessages;
