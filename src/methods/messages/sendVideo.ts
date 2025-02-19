import Client from '../..';

async function sendVideo(this: Client) {
  return await this.builder('sendVideo', {});
}

export default sendVideo;