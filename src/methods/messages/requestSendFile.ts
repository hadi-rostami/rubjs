import Client from '../..';
import { RequestSendFile } from '../../types/messages';

async function requestSendFile(
  this: Client,
  file_name: string,
  size: number,
  mime: string | null = null
): Promise<RequestSendFile> {
  const input = {
    file_name: file_name,
    size: new Number(size),
    mime: !mime ? file_name.split(".")[-1] : mime,
  };
  return await this.builder("requestSendFile", input);
}

export default requestSendFile;