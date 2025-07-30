import Client from "../../client";

async function searchChatMessages(
  this: Client,
  object_guid: string,
  search_text: string,
  type: "Text" | "Hashtag"
) {
  if (!["Text", "Hashtag"].includes(type)){
    console.warn('`type` argument can only be in ("text", "Hashtag"). Using default "Text".');
    type = "Text"
  }

  return await this.builder("searchChatMessages", {
    object_guid,
    search_text,
    type,
  });
}

export default searchChatMessages;
