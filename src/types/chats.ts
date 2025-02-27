import MessageUpdate, { ChatUpdates } from "./decorators";

interface Avatar {
  file_id: string;
  mime: string;
  dc_id: string;
  access_hash_rec: string;
}

interface getTopChatUsers {
  abs_users: {
    object_guid: string;
    type: string;
    first_name: string;
    avatar_thumbnail: Avatar;
    is_verified: boolean;
    is_deleted: boolean;
  }[];
  timestamp: string;
}

interface GetObjectInfoByUsername {
  exist: boolean;
  type: string;
  channel: {
    channel_guid: string;
    channel_title: string;
    avatar_thumbnail: Avatar;
    count_members: number;
    description: string;
    username: string;
    is_deleted: boolean;
    is_verified: boolean;
    share_url: string;
    channel_type: string;
    sign_messages: boolean;
    chat_reaction_setting: {
      reaction_type: string;
      selected_reactions: string[];
    };
    is_restricted_content: boolean;
  };
  chat: {
    object_guid: string;
    access: string[];
    count_unseen: number;
    is_mute: boolean;
    is_pinned: boolean;
    time_string: string;
    last_message: {
      message_id: string;
      type: string;
      text: string;
      is_mine: boolean;
    };
    last_seen_my_mid: string;
    last_seen_peer_mid: string;
    status: string;
    time: number;
    pinned_message_id: string;
    abs_object: {
      object_guid: string;
      type: string;
      title: string;
      avatar_thumbnail: [Object];
      is_verified: boolean;
      is_deleted: boolean;
    };
    is_blocked: boolean;
    last_message_id: string;
    last_deleted_mid: string;
    pinned_message_ids: string[];
  };
  timestamp: string;
}

interface SendLive {
  message_update: MessageUpdate;
  chat_update: ChatUpdates;
  status: string;
  publish_text: string;
}

export { getTopChatUsers, GetObjectInfoByUsername ,SendLive };
