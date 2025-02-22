import Client from "..";
import { MessageUpdate, Message as MessageType } from "./decorators";

class Message implements MessageUpdate {
  message_id: string;
  action: string;
  message: MessageType;
  updated_parameters: any[];
  timestamp: string;
  prev_message_id: string;
  object_guid: string;
  type: string;
  state: string;

  declare client: Client;

  constructor(client: Client, update: MessageUpdate) {
    Object.assign(this, update);

    Object.defineProperty(this, "client", {
      value: client,
      enumerable: false,
      writable: true,
      configurable: true,
    });
  }

  log() {
    console.log({ ...this });
  }

  async reply(text: string, object_guid?: string, message_id?: string) {
    return this.client.sendMessage(
      object_guid || this.object_guid,
      text,
      message_id || this.message_id
    );
  }
}

export default Message;
