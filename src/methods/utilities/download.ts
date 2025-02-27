import Client from "../..";
import { FileInline } from "../../types/decorators";

async function download(
  this: Client,
  file_inline: FileInline,
  callback?: (totalSize: number, downloadedSize: number) => Promise<void>,
  speed: boolean = false
) {
  return await this.network.download(
    file_inline.dc_id,
    file_inline.file_id,
    file_inline.access_hash_rec,
    file_inline.size,
    1054768,
    callback,
    speed
  );
}

export default download;
