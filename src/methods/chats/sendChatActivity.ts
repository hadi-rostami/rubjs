import Client from "../..";

async function sendChatActivity(
  this: Client,
  object_guid: string,
  activity: "Typing" | "Uploading" | "Recording"
) {
  if (["Typing", "Uploading", "Recording"].includes(activity))
    throw new Error(
      '`activity` argument can only be in `["Typing", "Uploading", "Recording"]`'
    );

  return await this.builder("sendChatActivity", { object_guid, activity });
}

export default sendChatActivity;
