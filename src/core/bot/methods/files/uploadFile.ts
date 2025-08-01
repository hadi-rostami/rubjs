import fs from 'fs';
import Bot from '../../bot';
import { fetch } from 'undici';
import FormData from 'form-data';

async function uploadFile(
	this: Bot,
	url: string,
	fileName: string,
	filePath: string,
) {
	if (!fs.existsSync(filePath)) {
		console.error('[ uploadFile ] File not found at:', filePath);
		return;
	}
	const form = new FormData();

	form.append('file', fs.createReadStream(filePath), {
		contentType: 'application/octet-stream',
		filename: fileName,
	});

	const res = await fetch(url, {
		method: 'POST',
		body: form,
		headers: form.getHeaders(),
		dispatcher: this.network.agent,
	});	

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`HTTP ${res.status}: ${text}`);
	}

	const data: any = await res.json();
	return data.data.file_id;
}

export default uploadFile;
