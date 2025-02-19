import Client from '../..';

async function sendSticker(this: Client) {
  return await this.builder('sendSticker', {});
}

export default sendSticker;