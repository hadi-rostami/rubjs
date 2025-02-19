import Client from '../..';

async function sendGif(this: Client) {
  return await this.builder('sendGif', {});
}

export default sendGif;