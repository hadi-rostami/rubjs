import Client from "../..";

async function sendPhoto(
  this: Client,
  object_guid: string,
  text: string,
  file_inline: Buffer<ArrayBufferLike> | string,
  reply_id?: string,
  is_spoil?: boolean,
  auto_delete?: number
) {
  return this.sendMessage(
    object_guid,
    text,
    reply_id,
    file_inline,
    "Image",
    is_spoil,
    true,
    false,
    auto_delete
  );
}

export default sendPhoto;
