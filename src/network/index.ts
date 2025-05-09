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
  private inactivityTimeout: NodeJS.Timeout | null = null;
  private Headers: { [key: string]: string };
  private client: Client;
  private apiUrl: string | null = null;
  private wssUrl: string | null = null;
  private ws: WebSocket | null = null;
  private agent: https.Agent;
  private reconnecting: boolean;
  session: Axios;

  constructor(client: Client) {
    this.client = client;
    this.Headers = {
      origin: "https://web.rubika.ir",
      referer: "https://web.rubika.ir/",
      "content-type": "application/json",
      connection: "keep-alive",
      "user-agent": client.userAgent,
    };
    this.reconnecting = false;

    if (client.defaultPlatform.platform === "Android") {
      delete this.Headers.origin;
      delete this.Headers.referer;
      this.Headers["user-agent"] = "okhttp/3.12.1";
    }

    this.agent = new https.Agent({ rejectUnauthorized: false });
    this.session = axios.create({
      headers: this.Headers,
      timeout: client.timeout || 10000,
      httpsAgent: this.agent,
    });
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
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  async request(url: string, data: Record<string, any>): Promise<any> {
    for (let i = 0; i < 3; i++) {
      try {
        const response: AxiosResponse = await this.session.post(url, data);
        if (response.status === 200) return response.data;
      } catch {
        console.error("Error in request");
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
    if (!this.apiUrl) await this.getDcs();

    const data: any = {
      api_version: this.client.apiVersion,
      [tmp_session ? "tmp_session" : "auth"]: tmp_session
        ? this.client.auth
        : this.client.decode_auth,
    };

    if (this.client.apiVersion === "6") {
      const data_enc = JSON.stringify({
        client: this.client.defaultPlatform,
        method,
        input,
      });
      data["data_enc"] = Crypto.encrypt(data_enc, this.client.key);

      if (!tmp_session) {
        data["sign"] = Crypto.sign(data["data_enc"], this.client.privateKey);
      }
    }
    return await this.request(this.apiUrl, data);
  }

  async getUpdates() {
    if (!this.wssUrl) await this.getDcs();
    this.ws = new WebSocket(this.wssUrl);

    this.ws.on("open", async () => {
      console.log("WebSocket connected.");
      this.reconnecting = false;
      await this.handleConnect();
      this.resetInactivityTimer();
    });
    this.ws.on("message", async (message) => {
      await this.handleMessage(message);
      this.resetInactivityTimer();
    });

    this.ws.on("error", async () => {
      if (!this.reconnecting) {
        console.error("WebSocket error, reconnecting...");
        this.reconnecting = true;
        await this.resetConnection();
      }
    });

    this.ws.on("close", async () => {
      if (!this.reconnecting) {
        console.warn("WebSocket closed, reconnecting...");
        this.reconnecting = true;
        await this.resetConnection();
      }
    });
  }

  async handleConnect() {
    console.log("Start Bot..");
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws?.send(
        JSON.stringify({
          api_version: "5",
          auth: this.client.auth,
          data: "",
          method: "handShake",
        })
      );
    }

    clearInterval(this.heartbeatInterval!);
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({}));
      }
    }, 30000);
  }

  async resetConnection() {
    this.ws?.close();
    this.ws = null;
    setTimeout(async () => {
      await this.getUpdates();
      this.reconnecting = false;
    }, 5000);
  }

  async handleMessage(message: string) {
    try {
      const { data_enc } = JSON.parse(message);
      if (!data_enc) return;
      const update = JSON.parse(Crypto.decrypt(data_enc, this.client.key));

      this.client.eventHandlers.forEach(
        async ({ callback, filters = [], updateType }) => {
          if (update[updateType]?.length > 0) {
            let username = null;
            const isMUp = updateType === "message_updates";

            if (isMUp) {
              if (update?.show_notifications?.length > 0) {
                const notification = update?.show_notifications?.[0];
                const obg = notification?.message_data?.object_guid;

                if (obg?.startsWith("u0")) {
                  username = notification.title;
                } else if (obg?.startsWith("g0")) {
                  username = notification.text?.split(":")[0];
                }
              } else {
                const chat_updates = update?.chat_updates?.[0];
                username =
                  chat_updates?.chat?.last_message?.author_title ||
                  "Unknown User";
              }
            }

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

              if (isMUp && messageData?.message) {
                messageData.message.author_title = username;
              }

              if (isValid)
                await callback(new Message(this.client, messageData));
            }
          }
        }
      );
    } catch (error) {
      console.error("Error in handleMessage:", error);
    }
  }

  private resetInactivityTimer() {
    clearTimeout(this.inactivityTimeout!);
    this.inactivityTimeout = setTimeout(async () => {
      console.warn(
        "No updates received for 10 minutes. Reconnecting WebSocket..."
      );
      await this.resetConnection();
    }, 10 * 60 * 1000);
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
          console.warn("Error in upload file!!");
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
          responseType: "arraybuffer",
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
