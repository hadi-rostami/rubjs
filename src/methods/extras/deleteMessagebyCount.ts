import Client from "../..";
import { DeleteMessage, Message } from "../../types/messages";

async function deleteMessagebyCount(
  this: Client,
  object_guid: string,
  message_id: string,
  count: number,
  sort: "FromMin" | "FromMax" = "FromMax",
  filter_type?:
    | "Music"
    | "File"
    | "Media"
    | "Voice"
    | "Gif"
    | "Groups"
    | "Channels"
) {
  const countLoop = Math.ceil(count / 25);
  const tasks: Promise<DeleteMessage>[] = [];

  for (let index = 0; index < countLoop; index++) {
    try {
      const res = await this.getMessages(
        object_guid,
        message_id,
        "25",
        sort,
        filter_type
      );

      if (!res.has_continue) break;

      message_id = res.new_max_id;
      const messagesID = res.messages.map(
        (message: Message) => message.message_id
      );

      tasks.push(this.deleteMessages(object_guid, messagesID));
    } catch (error) {
      console.error(`Error fetching messages: ${error}`);
    }
  }

  await Promise.allSettled(tasks);

  return true;
}

export default deleteMessagebyCount;
