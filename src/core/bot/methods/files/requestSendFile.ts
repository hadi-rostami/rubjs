import Bot from '../../bot';
import { FileTypeEnum } from '../../types/models';

async function requestSendFile(this: Bot, type: FileTypeEnum) {
	return await this.builder('requestSendFile', { type });
}

export default requestSendFile;
