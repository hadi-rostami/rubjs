import Client from "../..";

async function downloadProfilePicture(
  this: Client,
  object_guid: string
): Promise<Buffer | null> {
  let avatars = await this.getAvatars(object_guid);
  if (avatars) {
    avatars = avatars.avatars[0].main;
    const url = `https://messenger${avatars.dc_id}.iranlms.ir/InternFile.ashx`;

    const response = await this.network.session.get(url, {
      params: { id: avatars.file_id, ach: avatars.access_hash_rec },
      responseType: "arraybuffer",
    });

    if (response.status === 200) return await response.data;
  }
}

export default downloadProfilePicture;
