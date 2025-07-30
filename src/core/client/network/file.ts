import fs from 'fs';
import path from 'path';
import Network from '.';
import { request as undiciRequest } from 'undici';

export async function uploadFile(
	network: Network,
	filePath: string,
	chunkSize: number = 1048576,
): Promise<any> {
	if (!fs.existsSync(filePath))
		throw new Error('File not found in the given path');

	const stat = await fs.promises.stat(filePath);
	const fileSize = stat.size;
	const fileName = path.basename(filePath);
	const mime = filePath.split('.').pop();

	let result = await network.client.requestSendFile(fileName, fileSize, mime);

	let id: string = result.id;
	let dc_id: string = result.dc_id;
	let upload_url: string = result.upload_url;
	let access_hash_send: string = result.access_hash_send;
	let totalParts: number = Math.ceil(fileSize / chunkSize);

	const stream = fs.createReadStream(filePath, { highWaterMark: chunkSize });

	let index = 0;

	for await (const chunk of stream) {
		try {
			const res = await undiciRequest(upload_url, {
				method: 'POST',
				headers: {
					auth: network.client.auth,
					'file-id': id,
					'total-part': totalParts.toString(),
					'part-number': (index + 1).toString(),
					'chunk-size': chunk.length.toString(),
					'access-hash-send': access_hash_send,
				},
				body: chunk,
				dispatcher: network.agent,
			});

			const response: any = await res.body.json();

			if (response.status === 'ERROR_TRY_AGAIN') {
				console.log('Retrying upload...');
				stream.close();
				result = await network.client.requestSendFile(fileName, fileSize, mime);
				id = result.id;
				dc_id = result.dc_id;
				upload_url = result.upload_url;
				access_hash_send = result.access_hash_send;
				index = 0;

				return uploadFile(network, filePath, chunkSize);
			}

			index++;

			if (
				response.status === 'OK' &&
				response.status_det === 'OK' &&
				response.data?.access_hash_rec
			) {
				return {
					mime,
					size: fileSize,
					dc_id,
					file_id: id,
					file_name: fileName,
					access_hash_rec: response.data.access_hash_rec,
				};
			}
		} catch (error) {
			console.error('Upload error:', error);
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}
	}

	throw new Error('Upload failed completely.');
}


export async function download(
	network: Network,
	dc_id: number,
	file_id: number,
	access_hash: string,
	size: number,
	chunk: number = 131072,
): Promise<Buffer> {
	const headersBase = {
		auth: network.client.auth,
		'access-hash-rec': access_hash,
		'file-id': String(file_id),
		'user-agent': network.userAgent,
	};

	const base_url = `https://messenger${dc_id}.iranlms.ir`;

	const fetchChunk = async (
		start_index: number,
		last_index: number,
	): Promise<Buffer> => {
		const headers = {
			...headersBase,
			'start-index': String(start_index),
			'last-index': String(last_index),
		};

		try {
			const { body, statusCode } = await undiciRequest(
				`${base_url}/GetFile.ashx`,
				{
					method: 'POST',
					headers,
				},
			);

			if (statusCode !== 200 || !body) return Buffer.alloc(0);

			const chunks: Buffer[] = [];
			for await (const chunk of body) {
				chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
			}

			return Buffer.concat(chunks);
		} catch (err) {
			console.error(`[fetchChunk] Failed at ${start_index}-${last_index}`, err);
			return Buffer.alloc(0);
		}
	};

	let result = Buffer.alloc(0);
	let start_index = 0;

	while (start_index < size) {
		const last_index = Math.min(start_index + chunk, size) - 1;
		const chunkData = await fetchChunk(start_index, last_index);
		if (chunkData.length === 0) break;

		result = Buffer.concat([result, chunkData]);
		start_index = last_index + 1;
	}

	return result;
}
