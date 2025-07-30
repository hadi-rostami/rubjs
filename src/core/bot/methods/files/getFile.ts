import Bot from '../../bot';

async function getFile(this: Bot, file_id: string) {
	return await this.builder('getFile', { file_id });
}

export default getFile;
