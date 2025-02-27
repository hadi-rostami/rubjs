import Client from '../..';

async function  getTopChatUsers ( this: Client ) {
    return await this.builder('getTopChatUsers' , {});
};

export default getTopChatUsers;