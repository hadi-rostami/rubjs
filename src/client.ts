import Methods from "./methods";
import Network from "./network";
import SQLiteSession from "./session";
import { VoiceChatClient } from "./utils";

interface Platform {
  app_name: string;
  app_version: string;
  platform: string;
  package: string;
  lang_code: string;
}

type TypeUpdate =
  | "show_activities"
  | "chat_updates"
  | "message_updates"
  | "show_notifications";

type PlatformType = "Web" | "Android";

class Client extends Methods {
  defaultPlatform: Platform = {
    app_name: "Main",
    app_version: "4.4.9",
    platform: "Web",
    package: "web.rubika.ir",
    lang_code: "fa",
  };

  apiVersion: string = "6";
  userAgent: string = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36`;

  key: Buffer<ArrayBuffer>;
  decode_auth: string;

  auth: string | null;
  timeout: number;
  network: Network;
  privateKey: string | null;
  sessionFile: string;
  platform: PlatformType;
  userGuid: string | null;
  sessionDb: SQLiteSession;
  initialize: boolean;
  eventHandlers: {
    callback: Function;
    filters: ((msg) => boolean)[] |((msg) => boolean)[][]  ;
    updateType: TypeUpdate;
  }[];
  voiceChatClient: VoiceChatClient

  constructor(
    sessionFile: string,
    timeout?: number,
    platform: PlatformType = "Web"
  ) {
    super();

    if (platform.toLowerCase() === "android") {
      this.defaultPlatform.platform = "Android";
      this.defaultPlatform.package = "app.rbmain.a";
      this.defaultPlatform.app_version = "3.6.4";
    }

    this.sessionFile = sessionFile;
    this.userGuid = null;
    this.timeout = timeout ?? 0;
    this.eventHandlers = [];
    this.platform = platform;
    this.sessionDb = new SQLiteSession(sessionFile);
    this.network = new Network(this);
    this.auth = null;
    this.privateKey = null;
    this.eventHandlers = [];
    this.initialize = false;

    const DBInformation = this.sessionDb.getSession();
    if (DBInformation) {
      this.auth = DBInformation.auth;
      this.userGuid = DBInformation.guid;
      this.privateKey = DBInformation.private_key;

      if (typeof DBInformation.agent === "string")
        this.userAgent = DBInformation.agent || this.userAgent;
    }

    this.start();
  }
}

export default Client;
