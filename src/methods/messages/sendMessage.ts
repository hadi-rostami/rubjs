import * as fs from "fs";
import Client from "../..";
import { IAudioMetadata, parseBuffer } from "music-metadata";
import { thumbnail } from "../utilities";
import Markdown from "../../parser";

async function sendMessage(
  this: Client,
  object_guid: string,
  text: string | null = null,
  reply_to_message_id: string | null = null,
  file_inline: Buffer | string | null = null,
  type: string = "File",
  is_spoil: boolean = false,
  thumb: boolean | string = true,
  audio_info: boolean = false,
  auto_delete?: number
) {
  if (["me", "cloud", "self"].includes(object_guid.toLowerCase())) {
    object_guid = this.userGuid;
  }

  let input: Record<string, any> = {
    object_guid,
    reply_to_message_id,
    rnd: Math.floor(Math.random() * 1e6 + 1),
  };

  if (text) input = { ...input, ...Markdown.toMetadata(text) };
  let file_uploaded;
  let fileName: string | null = null;
  let audio_data: IAudioMetadata;

  if (file_inline) {
    if (typeof file_inline === "string") {
      fileName = file_inline;

      if (!fs.existsSync(fileName)) {
        throw new Error("File not found in the given path");
      }
      file_inline = await fs.promises.readFile(fileName);
    } else if (!Buffer.isBuffer(file_inline)) {
      throw new TypeError("File argument must be a file path or bytes");
    }
  }

  if (file_inline && Buffer.isBuffer(file_inline)) {
    if (!fileName) {
      fileName = `file_${Date.now()}` + type === "Image" ? ".png" : ".mp4";
      await fs.promises.writeFile(fileName, file_inline);
    }

    if (["Music", "Voice"].includes(type)) {
      thumb = false;
      if (audio_info) {
        audio_data = await parseBuffer(file_inline);
      }
    }

    if (thumb) {
      try {
        if (["Video", "Gif", "VideoMessage"].includes(type)) {
          thumb = await thumbnail.fromVideo(fileName);
        } else if (type === "Image") {
          thumb = await thumbnail.fromImage(fileName);
        }
      } catch (error) {
        console.error("Thumbnail generation error:", error);
        thumb = false;
      }
    }

    file_uploaded = await this.network.uploadFile(fileName);
    // await fs.promises.unlink(fileName);
    if (type === "VideoMessage") file_uploaded["is_round"] = true;

    file_uploaded["type"] = type === "VideoMessage" ? "Video" : type;
    file_uploaded["is_spoil"] = is_spoil;
    if (thumb) {
      file_uploaded["time"] = 0;
      file_uploaded["width"] = 320;
      file_uploaded["height"] = 320;
      file_uploaded["thumb_inline"] = thumb;
    }
    if (audio_info) {
      file_uploaded["music_performer"] = audio_data.common.title || "Unknown";
      file_uploaded["time"] = audio_data.format.duration || 0;
    }
  }

  if (file_inline) {
    input["file_inline"] = file_uploaded;
  }  

  const result = await this.builder("sendMessage", input);

  if (auto_delete) {
    const res = setTimeout(async () => {
      await this.deleteMessages(
        result.message_update.object_guid,
        result.message_update.message_id
      );

      clearTimeout(res);
    }, auto_delete * 1000);
  }

  return result;
}

export default sendMessage;
