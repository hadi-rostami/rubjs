import Client from '../..';

async function  resetContacts ( this: Client ) {
    return await this.builder('resetContacts' , {});
};

export default resetContacts;