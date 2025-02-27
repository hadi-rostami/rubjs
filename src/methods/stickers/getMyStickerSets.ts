import Client from '../..';

async function getMyStickerSets(this: Client) {
  return await this.builder('getMyStickerSets', {});
}

export default getMyStickerSets;