import { spawn } from "child_process";
import Client from "..";

class SendLiveClient {
  private client: Client;
  private title: string;
  private object_guid: string;
  private streamUrlRegex = /Stream url:\s*(rtmp:\/\/[^\n]+)/;
  private streamKeyRegex = /Stream key:\s*([^\n]+)/;
  private playlist: string[] = [];
  private currentIndex: number = 0;
  private getVideoUrl: () => Promise<string> | undefined;
  private ffmpeg?: any;
  private isPaused: boolean = false;
  private lastPosition: number = 0;

  constructor(
    client: Client,
    title: string,
    object_guid: string,
    getVideoUrl?: () => Promise<string>
  ) {
    this.client = client;
    this.getVideoUrl = getVideoUrl;
    this.title = title;
    this.object_guid = object_guid;
  }

  async detectOrientation(filePath: string): Promise<boolean> {
    return new Promise((resolve) => {
      const ffprobe = spawn("ffprobe", [
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height",
        "-of", "csv=p=0",
        filePath,
      ]);
      let output = "";
      ffprobe.stdout.on("data", (data) => {
        output += data.toString();
      });
      ffprobe.on("close", () => {
        const [width, height] = output.trim().split(",").map(Number);
        resolve(width > height);
      });
    });
  }

  async createLive(filePath?: string, startTime: number = 0) {
    if (!filePath) {
      if (!this.playlist.length && this.getVideoUrl) {
        this.playlist = [await this.getVideoUrl()];
      }
      filePath = this.playlist[this.currentIndex] ?? "";
    }

    if (!filePath) return;

    let isLandscape = await this.detectOrientation(filePath);
   
    let res = await this.client.sendLive(
      this.title,
      this.object_guid,
      filePath
    );

    const streamUrl = res.publish_text.match(this.streamUrlRegex)[1];
    const streamKey = res.publish_text.match(this.streamKeyRegex)[1];
    const streamSendUrl = streamUrl + streamKey;

    const resolution = !isLandscape ? "1920:1080" : "1080:1920";
    const rotateFilter = !isLandscape ? "" : "transpose=1,";
    const seekArgs = startTime > 0 ? ["-ss", startTime.toFixed(2)] : [];

    this.ffmpeg = spawn("ffmpeg", [
      "-re", 
      ...seekArgs,
      "-i", filePath,
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-b:v", "1200k",
      "-c:a", "aac",
      "-b:a", "128k",
      "-vf", `${rotateFilter}scale=${resolution}`,
      "-rtbufsize", "100M",
      "-f", "flv",
      streamSendUrl,
    ]);

    this.ffmpeg.on("close", (code) => {
      console.log(`FFmpeg process exited with code ${code}`);
    });
  }

  stop() {
    if (this.ffmpeg) {
      this.ffmpeg.kill();
      this.ffmpeg = undefined;
      this.isPaused = true;
      this.getCurrentTime();
    }
  }

  async getCurrentTime() {
    if (!this.ffmpeg) return;
    const ffprobe = spawn("ffprobe", ["-i", this.playlist[this.currentIndex], "-show_entries", "format=start_time", "-of", "default=noprint_wrappers=1:nokey=1"]);
    let output = "";
    ffprobe.stdout.on("data", (data) => {
      output += data.toString();
    });
    ffprobe.on("close", () => {
      this.lastPosition = parseFloat(output.trim()) || 0;
    });
  }

  resume() {
    if (this.isPaused) {
      this.createLive(this.playlist[this.currentIndex], this.lastPosition);
      this.isPaused = false;
    }
  }

  async next() {
    if (this.playlist.length > this.currentIndex + 1) {
      this.stop();
      this.currentIndex += 1;
      this.lastPosition = 0;
      this.isPaused = true;
      this.createLive(this.playlist[this.currentIndex]);
    }
  }

  previous() {
    if (this.currentIndex > 0) {
      this.stop();
      this.currentIndex--;
      this.lastPosition = 0;
      this.isPaused = true;
      this.createLive();
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
}

export default SendLiveClient;
