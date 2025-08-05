import fs from 'fs';
import Bot from '../../bot';
import { request } from 'undici';
import FormData from 'form-data';
import { basename } from 'path';

async function uploadFile(this: Bot, url: string, filePath: string) {
	if (!fs.existsSync(filePath)) {
		console.error('[ uploadFile ] File not found at:', filePath);
		return;
	}
	const stream = fs.createReadStream(filePath);

	const form = new FormData();
	form.append('file', stream, { filename: basename(filePath) });

	const res = await request(url, {
		method: 'POST',
		body: form,
		headers: form.getHeaders(),
	});

	const response: any = await res.body.json();

	if (res.statusCode !== 200 || response.status !== 'OK') {
		const text = await res.body.text();
		throw new Error(`HTTP ${res.statusCode}: ${text}`);
	}

	return response;
}

export default uploadFile;
