import Client from "../..";

async function forwardMessages(
  this: Client,
  from_object_guid: string,
  to_object_guid: string,
  message_ids: string | string[]
) {
  if (["me", "cloud", "self"].includes(to_object_guid.toLowerCase())) {
    to_object_guid = this.userGuid;
  }

  if (["me", "cloud", "self"].includes(from_object_guid.toLowerCase())) {
    from_object_guid = this.userGuid;
  }

  if (typeof message_ids === "string") message_ids = [message_ids];

  const input = {
    from_object_guid,
    to_object_guid,
    message_ids,
    rnd: Math.floor(Math.random() * 1e6 + 1),
  };

  return this.builder("forwardMessages", input);
}

export default forwardMessages;
