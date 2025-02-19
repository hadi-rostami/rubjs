import Client from '../..';

async function getMyGifSet(this: Client) {
  return await this.builder('getMyGifSet', {});
}

export default getMyGifSet;