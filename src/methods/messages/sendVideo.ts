import Client from "../..";

async function sendVideo(
  this: Client,
  object_guid: string,
  video: string | Buffer<ArrayBufferLike>,
  caption?: string,
  reply_to_message_id?: string,
  is_spoil?: boolean,
  thumb?: string | boolean,
  auto_delete?: number
) {
  return await this.sendMessage(
    object_guid,
    caption,
    reply_to_message_id,
    video,
    "Video",
    is_spoil,
    thumb,
    null,
    auto_delete
  );
}

export default sendVideo;
