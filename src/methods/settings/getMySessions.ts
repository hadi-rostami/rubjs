import Client from '../..';

async function getMySessions(this: Client) {
  return await this.builder('getMySessions', {});
}

export default getMySessions;