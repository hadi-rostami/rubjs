import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { optionalRequire } from 'optional-require';
const optionalWrtc = optionalRequire('wrtc');
import Client from '..';

class VoiceChatClient {
	private pc: RTCPeerConnection;
	private source: any;
	private track: any;
	private ffmpeg?: ChildProcessWithoutNullStreams;
	private buffer: Buffer = Buffer.alloc(0);
	private frameSize: number = 960;
	private playlist: string[] = [];
	private currentIndex: number = 0;
	private chatGuid?: string;
	private voiceChatId?: string;
	private client?: Client;
	private isPaused: boolean = false;
	private lastPosition: number = 0;
	private intervalId?: NodeJS.Timeout;
	private isManualSkip: boolean = false;
	private getMusicUrl?: () => Promise<string>;

	constructor(getMusicUrl?: () => Promise<string>) {
		if (!optionalWrtc) {
			throw new Error(
				'wrtc module is not installed. Some features may be disabled.',
			);
		}

		this.pc = new optionalWrtc.RTCPeerConnection();
		this.source = new optionalWrtc.nonstandard.RTCAudioSource();
		this.track = this.source.createTrack();
		this.pc.addTrack(this.track);
		this.getMusicUrl = getMusicUrl;
	}

	async play(filePath?: string) {
		if (this.ffmpeg) this.stop();

		if (!filePath) {
			if (this.playlist.length === 0) {
				if (this.getMusicUrl) {
					this.playlist = [await this.getMusicUrl()];
				} else return;
			}

			filePath = this.playlist[this.currentIndex];
		}

		if (!this.chatGuid || !this.voiceChatId || !this.client) {
			throw new Error(
				'Voice chat not initialized. Call `joinVoiceChat` first.',
			);
		}

		this.isPaused = false;
		this.isManualSkip = false;
		this.buffer = Buffer.alloc(0);

		const seekArgs =
			this.lastPosition > 0 ? ['-ss', this.lastPosition.toString()] : [];

		this.ffmpeg = spawn('ffmpeg', [
			'-loglevel',
			'quiet',
			'-re',
			'-threads',
			'1',
			'-protocol_whitelist',
			'file,http,https,tcp,tls',
			...seekArgs,
			'-i',
			filePath,
			'-acodec',
			'pcm_s16le',
			'-ar',
			'48000',
			'-ac',
			'1',
			'-f',
			's16le',
			'pipe:1',
		]);

		if (this.ffmpeg?.stdout) {
			this.ffmpeg.stdout.on('readable', () => {
				let chunk;
				while ((chunk = this.ffmpeg!.stdout!.read(this.frameSize)) !== null) {
					if (this.isPaused) return;

					const samples = new Int16Array(
						chunk.buffer,
						chunk.byteOffset,
						chunk.length / 2,
					);
					const trimmedSamples = samples.slice(0, 960);
					this.source.onData({ samples: trimmedSamples, sampleRate: 48000 });
					this.lastPosition += 0.02;
				}
			});
		}

		this.ffmpeg.on('close', async (code) => {
			if (!this.isManualSkip && code !== null && !this.isPaused) {
				await this.next();
			}
			this.isManualSkip = false;
		});

		this.clearIntervals();

		this.intervalId = setInterval(async () => {
			try {
				if (!this.client || !this.chatGuid || !this.voiceChatId) return;

				await this.client.getGroupVoiceChatUpdates(
					this.chatGuid,
					this.voiceChatId,
				);
			} catch {}
		}, 10 * 1000);

		this.intervalId = setInterval(async () => {
			try {
				if (
					this.isPaused ||
					!this.client ||
					!this.chatGuid ||
					!this.voiceChatId ||
					!this.client.userGuid
				)
					return;
				await this.client.sendVoiceChatActivity(
					this.chatGuid,
					this.voiceChatId,
					this.client.userGuid,
				);
			} catch {}
		}, 2 * 1000);
	}

	stop() {
		if (this.ffmpeg) {
			this.ffmpeg.kill();
			this.ffmpeg = undefined;
			this.isPaused = true;
			this.buffer = Buffer.alloc(0);
		}
	}

	resume() {
		if (this.isPaused) this.play();
	}

	async next() {
		if (this.playlist.length > this.currentIndex + 1) {
			this.isManualSkip = true;
			this.stop();
			this.currentIndex += 1;
			this.lastPosition = 0;
			this.isPaused = true;
			this.play(this.playlist[this.currentIndex]);
		} else {
			if (this.getMusicUrl) {
				this.playlist = [...this.playlist, await this.getMusicUrl()];
				await this.next();
			}
		}
	}

	previous() {
		if (this.currentIndex > 0) {
			this.isManualSkip = true;
			this.stop();
			this.currentIndex--;
			this.lastPosition = 0;
			this.isPaused = true;
			this.play();
		}
	}

	addToPlaylist(filePath: string) {
		this.playlist.push(filePath);
	}

	removeFromPlaylist(filePath: string) {
		const index = this.playlist.indexOf(filePath);
		if (index !== -1) {
			this.playlist.splice(index, 1);
			if (index <= this.currentIndex && this.currentIndex > 0) {
				this.currentIndex--;
			}
		}
	}

	async joinVoiceChat(chatGuid: string, voiceChatId: string, client: Client) {
		this.chatGuid = chatGuid;
		this.voiceChatId = voiceChatId;
		this.client = client;

		const offer = await this.pc.createOffer();
		if (!offer.sdp || !client.userGuid) return;

		await this.pc.setLocalDescription(offer);

		const connect = await client.joinGroupVoiceChat(
			chatGuid,
			voiceChatId,
			offer.sdp,
			client.userGuid,
		);
		const sdpAnswer = connect.sdp_answer_data;

		await this.pc.setRemoteDescription(
			new optionalWrtc.RTCSessionDescription({
				type: 'answer',
				sdp: sdpAnswer,
			}),
		);
		await client.setVoiceChatState(chatGuid, voiceChatId);
	}

	private clearIntervals() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = undefined;
		}
	}
}

export default VoiceChatClient;
