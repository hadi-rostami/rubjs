import Client from "../../client";
import { request as undiciRequest } from "undici";
import { Buffer } from "buffer";

async function downloadProfilePicture(
  this: Client,
  object_guid: string
): Promise<Buffer | null> {
  const avatarsInfo = await this.getAvatars(object_guid);
  if (!avatarsInfo || !avatarsInfo.avatars?.[0]?.main) return null;

  const avatar = avatarsInfo.avatars[0].main;
  const url = `https://messenger${avatar.dc_id}.iranlms.ir/InternFile.ashx?id=${avatar.file_id}&ach=${avatar.access_hash_rec}`;

  try {
    const { statusCode, body } = await undiciRequest(url, {
      method: "GET",
    });

    if (statusCode !== 200 || !body) return null;

    const chunks: Buffer[] = [];
    for await (const chunk of body) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }

    return Buffer.concat(chunks);
  } catch (err) {
    console.error("Failed to download profile picture:", err);
    return null;
  }
}

export default downloadProfilePicture;
