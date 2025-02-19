import Client from '../..';

async function sendVoice(this: Client) {
  return await this.builder('sendVoice', {});
}

export default sendVoice;