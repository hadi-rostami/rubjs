import Client from '../..';

async function sendDocument(this: Client) {
  return await this.builder('sendDocument', {});
}

export default sendDocument;