import Client from "../..";

async function sendMusic(
  this: Client,
  object_guid: string,
  music: string | Buffer<ArrayBufferLike>,
  caption?: string,
  reply_to_message_id?: string,
  is_spoil?: boolean,
  audio_info?: boolean,
  auto_delete?: number
) {
  return await this.sendMessage(
    object_guid,
    caption,
    reply_to_message_id,
    music,
    "Music",
    is_spoil,
    null,
    audio_info,
    auto_delete
  );
}

export default sendMusic;
