import https from "https";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Crypto } from "..";

interface PlatformInfo {
  app_name: string;
  app_version: string;
  platform: string;
  package: string;
  lang_code: string;
}

interface AuthInfo {
  auth?: string;
  decode_auth?: string;
  key?: Buffer;
  privateKey?: string;
}

interface SendOptions {
  input?: Record<string, any>;
  method?: string;
  tmp_session?: boolean;
}

interface DCResponse {
  data: {
    default_api: string;
    API: { [key: string]: string };
  };
}

interface ServerResponse {
  data_enc?: string;
  status?: string;
  status_det?: string;
  data?: Record<string, any>;
}

class Network {
  private Headers: Record<string, string>;
  private agent: https.Agent;
  private apiUrl: string | null = null;
  session: AxiosInstance;
  defaultPlatform: PlatformInfo = {
    app_name: "Main",
    app_version: "4.4.9",
    platform: "Web",
    package: "web.rubika.ir",
    lang_code: "fa",
  };

  userAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36`;

  constructor() {
    this.Headers = {
      origin: "https://web.rubika.ir",
      referer: "https://web.rubika.ir/",
      "content-type": "application/json",
      connection: "keep-alive",
      "user-agent": this.userAgent,
    };

    this.agent = new https.Agent({ rejectUnauthorized: false });

    this.session = axios.create({
      headers: this.Headers,
      timeout: 10000,
      httpsAgent: this.agent,
    });
  }

  async getDcs(): Promise<boolean> {
    while (true) {
      try {
        const response = await axios.get<DCResponse>(
          "https://getdcmess.iranlms.ir/",
          {
            httpsAgent: this.agent,
          }
        );

        if (response.status === 200) {
          const data = response.data.data;
          this.apiUrl = data.API[data.default_api] + "/";
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

  async send(
    { input = {}, method = "getUserInfo", tmp_session }: SendOptions,
    { auth, decode_auth, key, privateKey }: AuthInfo
  ): Promise<ServerResponse | undefined> {
    if (!this.apiUrl) await this.getDcs();

    const payload: Record<string, any> = {
      api_version: "6",
      [tmp_session ? "tmp_session" : "auth"]: tmp_session ? auth : decode_auth,
    };

    const data_enc = JSON.stringify({
      client: this.defaultPlatform,
      method,
      input,
    });

    payload["data_enc"] = Crypto.encrypt(data_enc, key!);

    if (!tmp_session && privateKey) {
      payload["sign"] = Crypto.sign(payload["data_enc"], privateKey);
    }

    return await this.request(this.apiUrl!, payload);
  }

  async bulder(
    name: string,
    input: Record<string, any>,
    { auth, key, decode_auth, privateKey }: AuthInfo,
    tmp_session = false
  ): Promise<Record<string, any> | undefined> {
    if (!auth) auth = Crypto.secret(32);
    if (!key) key = Buffer.from(Crypto.passphrase(auth), "utf8");

    const result = await this.send(
      {
        input,
        tmp_session,
        method: name,
      },
      { auth, key, decode_auth, privateKey }
    );

    if (result) {
      const { data_enc } = result;
      if (data_enc) {
        const decrypted = Crypto.decrypt(data_enc, key);
        const parsed = JSON.parse(decrypted);

        if (parsed.status === "OK" && parsed.status_det === "OK") {
          return { ...parsed.data, auth_data: auth, key_data: key };
        }
      }
    }
  }
}

export default Network;
