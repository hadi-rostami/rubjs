import Client from '../..';

async function getMe(this: Client) {
  return await this.getUserInfo()
}

export default getMe;