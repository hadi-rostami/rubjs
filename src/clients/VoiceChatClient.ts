import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { optionalRequire } from 'optional-require';
const optionalWrtc = optionalRequire('wrtc');
import Client from '..';

class VoiceChatClient {
  private pc: RTCPeerConnection;
  private source: any;
  private track: any;
  private ffmpeg?: ChildProcessWithoutNullStreams;
  private frameSize = 960 * 2; // 960 samples * 2 bytes
  private playlist: string[] = [];
  private currentIndex = 0;
  private chatGuid?: string;
  private voiceChatId?: string;
  private client?: Client;
  private isPaused = false;
  private lastPosition = 0;
  private audioTimer?: NodeJS.Timeout;
  private updateTimers: NodeJS.Timeout[] = [];
  private isManualSkip = false;
  private getMusicUrl?: () => Promise<string>;

  constructor(getMusicUrl?: () => Promise<string>) {
    if (!optionalWrtc) {
      throw new Error('wrtc module is not installed.');
    }

    this.pc = new optionalWrtc.RTCPeerConnection();
    this.source = new optionalWrtc.nonstandard.RTCAudioSource();
    this.track = this.source.createTrack();
    this.pc.addTrack(this.track);
    this.getMusicUrl = getMusicUrl;
  }

  async play(filePath?: string) {
    this.stop(); // clean up previous

    if (!filePath) {
      if (!this.playlist.length && this.getMusicUrl) {
        this.playlist = [await this.getMusicUrl()];
      }
      filePath = this.playlist[this.currentIndex];
    }

    if (!filePath || !this.chatGuid || !this.voiceChatId || !this.client) {
      throw new Error('Voice chat not initialized.');
    }

    this.isPaused = false;
    this.isManualSkip = false;

    const seekArgs = this.lastPosition > 0 ? ['-ss', this.lastPosition.toString()] : [];

    this.ffmpeg = spawn('ffmpeg', [
      '-loglevel', 'quiet',
      '-re',
      '-threads', '1',
      '-protocol_whitelist', 'file,http,https,tcp,tls',
      ...seekArgs,
      '-i', filePath,
      '-acodec', 'pcm_s16le',
      '-ar', '48000',
      '-ac', '1',
      '-f', 's16le',
      'pipe:1',
    ]);

    this.audioTimer = setInterval(() => {
      if (!this.ffmpeg || this.isPaused) return;
      const chunk = this.ffmpeg.stdout.read(this.frameSize);
      if (!chunk) return;

      const samples = new Int16Array(chunk.buffer, chunk.byteOffset, chunk.length / 2);
      this.source.onData({ samples, sampleRate: 48000 });
      this.lastPosition += 0.02;
    }, 20); // 20ms = 960 samples

    this.ffmpeg.on('close', async () => {
      clearInterval(this.audioTimer);
      if (!this.isManualSkip && !this.isPaused) {
        await this.next();
      }
      this.isManualSkip = false;
    });

    this.setTimers();
  }

  stop() {
    this.ffmpeg?.kill();
    this.ffmpeg = undefined;
    this.isPaused = true;
    clearInterval(this.audioTimer);
    this.clearTimers();
  }

  resume() {
    if (this.isPaused) this.play(this.playlist[this.currentIndex]);
  }

  async next() {
    if (this.currentIndex + 1 < this.playlist.length) {
      this.isManualSkip = true;
      this.currentIndex++;
      this.lastPosition = 0;
      this.play(this.playlist[this.currentIndex]);
    } else if (this.getMusicUrl) {
      this.playlist.push(await this.getMusicUrl());
      await this.next();
    }
  }

  previous() {
    if (this.currentIndex > 0) {
      this.isManualSkip = true;
      this.currentIndex--;
      this.lastPosition = 0;
      this.play(this.playlist[this.currentIndex]);
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
    const connect = await client.joinGroupVoiceChat(chatGuid, voiceChatId, offer.sdp, client.userGuid);
    await this.pc.setRemoteDescription(new optionalWrtc.RTCSessionDescription({
      type: 'answer',
      sdp: connect.sdp_answer_data,
    }));
    await client.setVoiceChatState(chatGuid, voiceChatId);
  }

  private setTimers() {
    this.clearTimers();

    this.updateTimers.push(setInterval(async () => {
      if (this.client && this.chatGuid && this.voiceChatId) {
        await this.client.getGroupVoiceChatUpdates(this.chatGuid, this.voiceChatId);
      }
    }, 10 * 1000));

    this.updateTimers.push(setInterval(async () => {
      if (
        this.client && this.chatGuid && this.voiceChatId &&
        this.client.userGuid && !this.isPaused
      ) {
        await this.client.sendVoiceChatActivity(this.chatGuid, this.voiceChatId, this.client.userGuid);
      }
    }, 2 * 1000));
  }

  private clearTimers() {
    this.updateTimers.forEach(clearInterval);
    this.updateTimers = [];
  }
}

export default VoiceChatClient;
