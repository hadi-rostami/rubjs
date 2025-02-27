import MessageUpdate, { ChatUpdates } from "./decorators";

interface ChatReactionSetting {
  reaction_type: string;
}

interface Group {
  group_guid: string;
  group_title: string;
  count_members: number;
  is_deleted: boolean;
  is_verified: boolean;
  slow_mode: number;
  chat_history_for_new_members: string;
  event_messages: boolean;
  chat_reaction_setting: ChatReactionSetting;
  is_restricted_content: boolean;
}

interface Chat {
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
  };
  last_seen_my_mid: string;
  last_seen_peer_mid: string;
  status: string;
  time: number;
  abs_object: {
    object_guid: string;
    type: string;
    title: string;
    is_verified: boolean;
    is_deleted: boolean;
  };
  is_blocked: boolean;
  last_message_id: string;
  last_deleted_mid: string;
  slow_mode_duration: number;
}

interface ChatUpdate {
  object_guid: string;
  action: string;
  updated_parameters: [];
  timestamp: string;
  type: string;
  chat?: Chat;
}

interface GroupVoiceChat {
  voice_chat_id: string;
  state: string;
  join_muted: boolean;
  participant_count: number;
  title: string;
  version: number;
}

interface GroupVoiceChatUpdate {
  voice_chat_id: string;
  group_guid: string;
  action: string;
  group_voice_chat: GroupVoiceChat;
  updated_parameters: [];
  timestamp: string;
  chat_guid_type: {
    type: string;
    object_guid: string;
  };
}

interface GroupMember {
  member_type: string;
  member_guid: string;
  first_name: string;
  last_name: string;
  avatar_thumbnail: {
    file_id: string;
    mime: string;
    dc_id: string;
    access_hash_rec: string;
  };
  is_verified: boolean;
  is_deleted: boolean;
  last_online: number;
  join_type: string;
  username: string;
  online_time: { type: string; exact_time: number };
}

interface AddGroup {
  group: Group;
  chat_update: ChatUpdate;
  message_update: MessageUpdate;
  timestamp: string;
}

interface DeleteNoAccessGroupChat {
  chat_update: ChatUpdate;
  status: string;
}

interface CreateGroupVoiceChat {
  status: string;
  chat_update: ChatUpdates;
  message_update: MessageUpdate;
  group_voice_chat_update: GroupVoiceChatUpdate;
}

interface AddGroupMembers {
  chat_update: ChatUpdates;
  message_update: MessageUpdate;
  added_in_chat_members: GroupMember[];
  timestamp: string;
  group: Group;
}

interface BanGroupMember {
  chat_update: ChatUpdates;
  message_update: MessageUpdate;
  timestamp: string;
  group: Group;
}

interface GetBannedGroupMembers {
  in_chat_members: GroupMember[];
  next_start_id: "67b0e8bc1b50d7bec6fc950b";
  has_continue: false;
  timestamp: "1739888215";
}

export {
  AddGroup,
  DeleteNoAccessGroupChat,
  CreateGroupVoiceChat,
  AddGroupMembers,
  BanGroupMember,
  GetBannedGroupMembers
};
