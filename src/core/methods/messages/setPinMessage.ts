import Client from "../../client";

async function setPinMessage(
  this: Client,
  object_guid: string,
  message_id: string,
  action: "Pin" | "Unpin" = "Pin"
) {
  if (!["Pin", "Unpin"].includes(action)){
    console.warn(`The ${action} argument can only be in ("Pin", "Unpin"). Using default "Pin".`);
    action = "Pin"
  }

  return await this.builder("setPinMessage", {
    object_guid,
    message_id,
    action,
  });
}

export default setPinMessage;
