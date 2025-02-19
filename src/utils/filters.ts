

const Filters = {
  findKey: (message, key) => {
    const messageKeys = Object.keys(message);

    if (messageKeys.includes(key)) {
      return message[key];
    }

    for (const messageKey of messageKeys) {
      const value = message[messageKey];

      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === "object") {
            const found = Filters.findKey(item, key);
            if (found !== undefined) return found;
          }
        }
      }

      if (typeof value === "object") {
        const found = Filters.findKey(value, key);
        if (found !== undefined) return found;
      }
    }

    return undefined;
  },

  guidType: (message, startWith): boolean => {
    let result: string | undefined = Filters.findKey(message, "object_guid");

    const resultData = result && result.startsWith(startWith);

    return resultData;
  },

  is_reply: (message) => !!Filters.findKey(message, "reply_to_message_id"),
  is_edited: (message) => !!Filters.findKey(message, "is_edited"),
  is_link: (message) => {
    const link = Filters.findKey(message, "text");
    if (!link) return false;

    const RUBIKA_LINK_PATTERN = /\brubika\.ir\b/;
    const USERNAME_PATTERN = /@([a-zA-Z0-9_]{3,32})/;

    return (
      link.includes("http") ||
      RUBIKA_LINK_PATTERN.test(link) ||
      USERNAME_PATTERN.test(link)
    );
  },

  is_text: (message) => !!Filters.findKey(message, "text"),
  is_group: (message) => Filters.guidType(message, "g0"),
  is_channel: (message) => Filters.guidType(message, "c0"),
  is_private: (message) => Filters.guidType(message, "u0"),
  is_froward: (message) => !!Filters.findKey(message, "forwarded_from"),
  is_file_inline: (message) => !!Filters.findKey(message, "file_inline"),
  // is_file: (message) => !!Filters.findKey(message, "File"),
  // is_photo: (message) => !!Filters.findKey(message, "Image"),
  // is_sticker: (message) => !!Filters.findKey(message, "Sticker"),
  // is_video: (message) => !!Filters.findKey(message, "Video"),
  // is_voice: (message) => !!Filters.findKey(message, "Voice"),
  // is_gif: (message) => !!Filters.findKey(message, "Gif"),
  // is_audio: (message) => !!Filters.findKey(message, "Music"),
  // is_location: (message) => !!Filters.findKey(message, "Location"),
  // is_contact: (message) => !!Filters.findKey(message, "ContactMessage"),
  is_poll: (message) => !!Filters.findKey(message, "poll"),
  is_live: (message) => !!Filters.findKey(message, "live_data"),
  is_event: (message) => !!Filters.findKey(message, "event_data"),
};

export default Filters;
