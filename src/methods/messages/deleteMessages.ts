import Client from "../..";

async function deleteMessages(
  this: Client,
  object_guid: string,
  message_ids: string | string[],
  type: "Global" | "Local" = "Global"
) {
  if (!["Global", "Local"].includes(type))
    throw new Error('`type` argument can only be in ("Global", "Local").');

  if (typeof message_ids === "string") {
    message_ids = [message_ids];
  }

  return await this.builder("deleteMessages", {
    object_guid,
    message_ids,
    type,
  });
}

export default deleteMessages;
