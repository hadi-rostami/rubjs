import Client from "../..";

async function uploadAvatar(
  this: Client,
  object_guid: string,
  image: string | Buffer<ArrayBufferLike>
) {
  if (["me", "cloud", "self"].includes(object_guid.toLocaleLowerCase()))
    object_guid = this.userGuid;

  let file_name: string;
  
  if (typeof image == "string") file_name = image.split("/")[-1];
  else file_name = "avatar.jpg";

  const upload = await this.network.uploadFile(image);

  return await this.builder("uploadAvatar", {
    object_guid,
    thumbnail_file_id: upload.file_id,
    main_file_id: upload.file_id,
  });
}

export default uploadAvatar;
