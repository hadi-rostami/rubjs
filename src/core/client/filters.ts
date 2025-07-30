import { MessageUpdate, FileInline } from "./types/decorators.type";

class ClientFilters {
  static findKey(message: any, key: string): any {
    if (!message || typeof message !== "object") {
      return undefined;
    }

    const messageKeys = Object.keys(message);
    if (messageKeys.includes(key)) {
      return message[key];
    }

    for (const messageKey of messageKeys) {
      const value = message[messageKey];

      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === "object") {
            const found = ClientFilters.findKey(item, key);
            if (found !== undefined) return found;
          }
        }
      }

      if (typeof value === "object") {
        const found = ClientFilters.findKey(value, key);
        if (found !== undefined) return found;
      }
    }

    return undefined;
  }

  static guidType(message: MessageUpdate, startWith: string): boolean {
    const result = ClientFilters.findKey(message, "object_guid");
    return result?.startsWith(startWith) ?? false;
  }

  static isMention(message: MessageUpdate): boolean {
    return !!ClientFilters.findKey(
      message.message?.metadata?.meta_data_parts,
      "link"
    );
  }

  static isMarkdown(message: MessageUpdate): boolean {
    return !!ClientFilters.findKey(message.message, "metadata");
  }

  static isReply(message: MessageUpdate): boolean {
    return !!ClientFilters.findKey(message, "reply_to_message_id");
  }

  static isEdited(message: MessageUpdate): boolean {
    return !!ClientFilters.findKey(message, "is_edited");
  }

  static isLink(message: MessageUpdate): boolean {
    const link = ClientFilters.findKey(message, "text");
    if (!link) return false;

    const RUBIKA_LINK_PATTERN = /\brubika\.ir\b/;
    const USERNAME_PATTERN = /@([a-zA-Z0-9_]{3,32})/;

    return (
      link.includes("http") ||
      RUBIKA_LINK_PATTERN.test(link) ||
      USERNAME_PATTERN.test(link)
    );
  }

  static isText(message: MessageUpdate): boolean {
    return !!ClientFilters.findKey(message, "text");
  }

  static isGroup(message: MessageUpdate): boolean {
    return ClientFilters.guidType(message, "g0");
  }

  static isChannel(message: MessageUpdate): boolean {
    return ClientFilters.guidType(message, "c0");
  }

  static isPrivate(message: MessageUpdate): boolean {
    return ClientFilters.guidType(message, "u0");
  }

  static isForward(message: MessageUpdate): boolean {
    return !!ClientFilters.findKey(message, "forwarded_from");
  }

  static fileInline(message: MessageUpdate): FileInline | undefined {
    return message.message?.file_inline;
  }

  static isFileInline(message: MessageUpdate): boolean {
    return ["FileInline", "FileInlineCaption"].includes(message.message?.type);
  }

  static isFile(message: MessageUpdate): boolean {
    return ClientFilters.fileInline(message)?.type === "File";
  }

  static isPhoto(message: MessageUpdate): boolean {
    return ClientFilters.fileInline(message)?.type === "Image";
  }

  static isSticker(message: MessageUpdate): boolean {
    return ClientFilters.fileInline(message)?.type === "Sticker";
  }

  static isVideo(message: MessageUpdate): boolean {
    return ClientFilters.fileInline(message)?.type === "Video";
  }

  static isVoice(message: MessageUpdate): boolean {
    return ClientFilters.fileInline(message)?.type === "Voice";
  }

  static isGif(message: MessageUpdate): boolean {
    return ClientFilters.fileInline(message)?.type === "Gif";
  }

  static isMusic(message: MessageUpdate): boolean {
    return ClientFilters.fileInline(message)?.type === "Music";
  }

  static isLocation(message: MessageUpdate): boolean {
    return !!ClientFilters.findKey(message.message, "location");
  }

  static isContact(message: MessageUpdate): boolean {
    return !!ClientFilters.findKey(message.message, "contact_message");
  }

  static isPoll(message: MessageUpdate): boolean {
    return !!ClientFilters.findKey(message, "poll");
  }

  static isLive(message: MessageUpdate): boolean {
    return !!ClientFilters.findKey(message, "live_data");
  }

  static isEvent(message: MessageUpdate): boolean {
    return !!ClientFilters.findKey(message, "event_data");
  }


  static isLength(length: number, object_guid?: string) {
    return (message: MessageUpdate) => {
      if (object_guid) {
        if (object_guid !== message.object_guid) return false;
      }
      if (message?.message?.text) {
        return message?.message?.text.length === length;
      }
      return false;
    };
  }

  static startsWithCommand(
    text: string,
    object_guid?: string,
    length?: number
  ) {
    return (message: MessageUpdate) => {
      if (object_guid) {
        if (object_guid !== message.object_guid) return false;
      }
      if (message?.message?.text) {
        if (length) {
          if (message?.message?.text.length !== length) return false;
        }
        return message.message.text.startsWith(text);
      }
    };
  }

  static equalCommand(text: string, object_guid?: string) {
    return (message: MessageUpdate) => {
      if (object_guid) {
        if (object_guid !== message.object_guid) return false;
      }
      if (message?.message?.text) {
        return message.message.text === text;
      }
    };
  }
}

export default ClientFilters;
