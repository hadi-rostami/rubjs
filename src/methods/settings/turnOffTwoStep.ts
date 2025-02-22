import Client from '../..';

async function  turnOffTwoStep ( this: Client  , password: string) {
    return await this.builder('turnOffTwoStep' , {password});
};

export default turnOffTwoStep;