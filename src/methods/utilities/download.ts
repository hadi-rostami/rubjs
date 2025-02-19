import Client from '../..';

async function download(this: Client) {
  return await this.builder('download', {});
}

export default download;