import axios, { Axios, AxiosRequestConfig, AxiosResponse } from "axios";
import WebSocket from "ws";
import Crypto from "../crypto";
import https from "https";
import Client from "..";
import * as fs from "fs";
import * as path from "path";
import { Message } from "../types";

interface UploadResponse {
  data: {
    status: string;
    status_det: string;
    dev_message: null | string;
    user_messsage: null | string;
    data: { access_hash_rec: string };
    data_enc: null | string;
  };
}

class Network {
  private heartbeatInterval: NodeJS.Timeout | null = null;
  Headers: { [key: string]: string } = {
    origin: "https://web.rubika.ir",
    referer: "https://web.rubika.ir/",
    "content-type": "application/json",
    connection: "keep-alive",
  };

  client: Client;
  session: Axios;
  apiUrl: null | string;
  wssUrl: null | string;
  ws: WebSocket;
  agent: https.Agent;

  constructor(client: Client) {
    this.client = client;
    this.Headers["user-agent"] = this.client.userAgent;

    if (this.client.defaultPlatform.platform === "Android") {
      delete this.Headers.origin;
      delete this.Headers.referer;
      this.Headers["user-agent"] = "okhttp/3.12.1";
    }
    this.agent = new https.Agent({ rejectUnauthorized: false });
    const axiosConfig = {
      headers: this.Headers,
      timeout: this.client.timeout || 10000,
      httpsAgent: this.agent,
    };

    this.session = axios.create(axiosConfig);

    this.apiUrl = null;
    this.wssUrl = null;
    this.ws = null;
  }

  async getDcs(): Promise<boolean> {
    while (true) {
      try {
        const response = await axios.get("https://getdcmess.iranlms.ir/", {
          httpsAgent: this.agent,
        });

        if (response.status === 200) {
          const data = response.data.data;

          this.apiUrl = data.API[data.default_api] + "/";
          this.wssUrl = data.socket[data.default_socket];
          return true;
        }
      } catch {
        console.error("Error while fetching dcs");
        continue;
      }
    }
  }

  async request(url: string, data: Record<string, any>): Promise<any> {
    for (let i = 0; i < 3; i++) {
      try {
        const response: AxiosResponse = await this.session.post(url, data);

        if (response.status === 200) {
          return response.data;
        }
      } catch (error) {
        console.error("Error in request ");
        continue;
      }
    }
    throw new Error("Failed to get response after 3 attempts");
  }

  async send({
    input = {},
    method = "getUserInfo",
    tmp_session,
  }: {
    input: object;
    method: string;
    tmp_session: boolean;
  }): Promise<any> {
    let api_version = this.client.apiVersion;
    let auth = this.client.auth;
    let client = this.client.defaultPlatform;

    if (!this.apiUrl) await this.getDcs();

    let url = this.apiUrl;

    let data: any = { api_version };

    data[tmp_session ? "tmp_session" : "auth"] = tmp_session
      ? auth
      : this.client.decode_auth;

    if (api_version === "6") {
      const data_enc = JSON.stringify({
        client,
        method,
        input,
      });

      data["data_enc"] = Crypto.encrypt(data_enc, this.client.key);

      if (!tmp_session) {
        data["sign"] = Crypto.sign(data["data_enc"], this.client.privateKey);
      }

      return await this.request(url, data);
    }
  }

  async getUpdates() {
    if (!this.wssUrl) await this.getDcs();

    this.ws = new WebSocket(this.wssUrl);

    this.ws.on("open", async () => await this.handleConnect());

    this.ws.on("message", async (message) => await this.handleMessage(message));

    this.ws.on("error", async () => await this.resetConnection());
  }

  async handleConnect() {
    console.log("Start Bot..");

    const handshakeRequest = {
      api_version: "5",
      auth: this.client.auth,
      data: "",
      method: "handShake",
    };

    this.ws.send(JSON.stringify(handshakeRequest));

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({}));
      }
    }, 30 * 1000);
  }

  async resetConnection() {
    setTimeout(() => this.getUpdates(), 5000);
  }

  async handleMessage(message: string) {
    try {
      const { data_enc } = JSON.parse(message);
      if (!data_enc) return;

      const update = JSON.parse(Crypto.decrypt(data_enc, this.client.key));

      this.client.eventHandlers.forEach(
        async ({ callback, filters = [], updateType }) => {
          if (update[updateType].length > 0) {
            for (let messageData of update[updateType]) {
              if (!messageData) return;

              const isValid =
                filters.length === 0 ||
                filters.every((filter) => {
                  if (typeof filter === "function") return filter(messageData);

                  for (let filterCriteria of filter) {
                    let isMatch = filterCriteria(messageData);
                    if (isMatch === true) return true;
                  }
                  return false;
                });

              const dataMessage = new Message(this.client, messageData);

              if (isValid) {
                await callback(dataMessage);
              }
            }
          }
        }
      );
    } catch (error) {
      console.error("Error in handleMessage:", error);
    }
  }

  async uploadFile(
    file: Buffer<ArrayBufferLike> | string,
    mime: string | null = null,
    fileName: string | null = null,
    chunk: number = 1048576,
    callback = null
  ) {
    if (typeof file === "string") {
      if (!fs.existsSync(file))
        throw new Error("File not found in the given path");

      if (!fileName) fileName = path.basename(file);

      file = await fs.promises.readFile(file);
    } else if (!Buffer.isBuffer(file))
      throw new TypeError("File argument must be a file path or bytes");

    if (!fileName) throw new Error("File name is not set");

    if (!mime) mime = fileName.split(".").pop() || "application/octet-stream";

    let result = await this.client.requestSendFile(fileName, file.length, mime);

    let response: UploadResponse;
    let id: string = result.id;
    let index: number = 0;
    let dc_id: string = result.dc_id;
    let total: number = Math.ceil(file.length / chunk);
    let upload_url: string = result.upload_url;
    let access_hash_send: string = result.access_hash_send;

    while (index < total) {
      let data = file.slice(index * chunk, index * chunk + chunk);

      try {
        response = await this.session.post(upload_url, data, {
          headers: {
            auth: this.client.auth,
            "file-id": id,
            "total-part": total.toString(),
            "part-number": (index + 1).toString(),
            "chunk-size": data.length.toString(),
            "access-hash-send": access_hash_send,
          },
        });

        if (response.data.status === "ERROR_TRY_AGAIN") {
          console.log("Retrying upload...");
          result = await this.client.requestSendFile(
            fileName,
            file.length,
            mime
          );
          id = result.id;
          index = 0;
          dc_id = result.dc_id;
          total = Math.ceil(file.length / chunk);
          upload_url = result.upload_url;
          access_hash_send = result.access_hash_send;
          continue;
        }

        if (callback) {
          try {
            callback(file.length, index * chunk);
          } catch (err) {
            console.error("Callback error:", err);
          }
        }

        index++;
      } catch (error) {
        console.error("Upload error:", error);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      if (response.data.status === "OK" && response.data.status_det === "OK") {
        if (!response.data.data?.access_hash_rec)
          throw new Error("Error in upload file!!");
        return {
          mime,
          size: file.length,
          dc_id,
          file_id: id,
          file_name: fileName,
          access_hash_rec: response.data.data.access_hash_rec,
        };
      }

      throw new Error(response.data.status_det);
    }
  }

  async download(
    dc_id: number,
    file_id: number,
    access_hash: string,
    size: number,
    chunk: number = 131072,
    callback?: (totalSize: number, downloadedSize: number) => Promise<void>,
    speed: boolean = false
  ): Promise<Buffer> {
    const headers = {
      auth: this.client.auth,
      "access-hash-rec": access_hash,
      "file-id": String(file_id),
      "user-agent": this.client.userAgent,
    };

    const base_url = `https://messenger${dc_id}.iranlms.ir`;

    const fetchChunk = async (
      start_index: number,
      last_index: number
    ): Promise<Buffer> => {
      const chunk_headers = {
        ...headers,
        "start-index": String(start_index),
        "last-index": String(last_index),
      };
      try {
        const config: AxiosRequestConfig = {
          headers: chunk_headers,
        };
        const response = await axios.post(
          `${base_url}/GetFile.ashx`,
          {},
          config
        );
        return Buffer.from(response.data);
      } catch (e) {
        return Buffer.alloc(0);
      }
    };

    if (speed) {
      const tasks: Promise<Buffer>[] = [];
      for (let start_index = 0; start_index < size; start_index += chunk) {
        const last_index = Math.min(start_index + chunk, size) - 1;
        tasks.push(fetchChunk(start_index, last_index));
      }

      const resultChunks = await Promise.all(tasks);
      const result = Buffer.concat(resultChunks);

      if (callback) {
        await callback(size, result.length);
      }

      return result;
    } else {
      let result = Buffer.alloc(0);
      let start_index = 0;

      while (start_index < size) {
        const last_index = Math.min(start_index + chunk, size) - 1;
        const data = await fetchChunk(start_index, last_index);
        if (data.length === 0) break;

        result = Buffer.concat([result, data]);
        start_index = last_index + 1;

        if (callback) {
          await callback(size, result.length);
        }
      }

      return result;
    }
  }
}

export default Network;
