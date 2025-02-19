import Client from '../..';

async function sendMusic(this: Client) {
  return await this.builder('sendMusic', {});
}

export default sendMusic;