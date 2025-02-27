import Client from '../..';

async function getPrivacySetting(this: Client) {
  return await this.builder('getPrivacySetting', {});
}

export default getPrivacySetting;