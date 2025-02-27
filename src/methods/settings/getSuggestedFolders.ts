import Client from '../..';

async function getSuggestedFolders(this: Client) {
  return await this.builder('getSuggestedFolders', {});
}

export default getSuggestedFolders;