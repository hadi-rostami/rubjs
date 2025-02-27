import MessageUpdate, { ChatUpdates } from "./decorators";

interface Reaction {
  user_guids: string[];
  reaction_count: number;
  emoji_char: string;
  reaction_id: number;
  is_selected: boolean;
}

interface MetaData {
  meta_data_parts: {
    from_index: number;
    length: number;
    type: string;
    link?: { url: string };
  }[];
}

interface Message {
  message_id: string;
  text: string;
  time?: string;
  is_edited?: boolean;
  type: string;
  author_type: string;
  author_object_guid: string;
  allow_transcription?: boolean;
  reactions?: Reaction[];
  metadata?: MetaData;
}

interface Chat {
  object_guid: string;
  action: string;
  updated_parameters: string[];
  timestamp: string;
  type: string;
}

interface ChatWithLastMessage extends Chat {
  chat: {
    time_string?: string;
    time?: number;
    last_message_id: string;
    last_message: Message & { is_mine?: boolean; author_title?: string };
  };
}

interface ChatWithPin extends Chat {
  chat: { pinned_message_id: string; pinned_message_ids: string[] };
}

interface MessageUpdateBase {
  message_id: string;
  action: string;
  updated_parameters: string[];
  timestamp: string;
  object_guid: string;
  type: string;
  state: string;
}

interface EditMessage {
  message_update: MessageUpdateBase & { message: { text: string; is_edited: boolean } };
  chat_update: ChatWithLastMessage;
}

interface DeleteMessage {
  chat_update: ChatWithLastMessage;
  message_updates: MessageUpdateBase[];
}

interface ForwardMessages {
  message_updates: MessageUpdate[];
  status: string;
  chat_update: ChatUpdates;
}

interface GetBannedGroupMembers {
  in_chat_members: {
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
    removed_by_object_guid: string;
    removed_by_object_type: string;
    join_type: string;
    username: string;
    online_time: { type: string; exact_time: number };
  }[];
  next_start_id: string;
  has_continue: boolean;
  timestamp: string;
}

interface GetMessagesBase {
  messages: Message[];
  timestamp: string;
}

interface GetMessagesInterval extends GetMessagesBase {
  state: string;
  new_has_continue: boolean;
  old_has_continue: boolean;
  new_min_id: number;
  old_max_id: number;
}

interface GetMessagesUpdates {
  updated_messages: MessageUpdateBase[];
  new_state: number;
  status: string;
}

interface PollVoter {
  object_guid: string;
  type: string;
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
}

interface GetPollOptionVoters {
  voters_abs_objects: PollVoter[];
  has_continue: boolean;
  next_start_id: string;
}

interface GetPollStatus {
  poll_status: {
    state: string;
    selection_index: number;
    percent_vote_options: number[];
    total_vote: number;
    show_total_votes: boolean;
    voters_object_guids: string[];
    correct_option_index: number;
    explanation: string;
  };
}

interface SendMessageResult {
  message_update: MessageUpdate;
  status: string;
  chat_update: ChatUpdates;
}

interface SetPinMessage {
  chat_update: ChatWithPin;
  status: string;
}


interface RequestSendFile {
  id: string;
  dc_id: string;
  access_hash_send: string;
  upload_url: string;
}

interface GetMessageShareUrl {
  share_url?: string;
  has_share_url: boolean;
}

export {
  Reaction,
  Message,
  Chat,
  ChatWithLastMessage,
  ChatWithPin,
  MessageUpdateBase,
  EditMessage,
  DeleteMessage,
  ForwardMessages,
  GetBannedGroupMembers,
  GetMessagesBase,
  GetMessagesInterval,
  GetMessagesUpdates,
  GetPollOptionVoters,
  GetPollStatus,
  SendMessageResult,
  SetPinMessage,
  RequestSendFile,
  GetMessageShareUrl
};
