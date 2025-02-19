import Client from '../..';

async function sendVideoMessage(this: Client) {
  return await this.builder('sendVideoMessage', {});
}

export default sendVideoMessage;