interface AvatarThumbnail {
  file_id: string;
  mime: string;
  dc_id: string;
  access_hash_rec: string;
}

interface OnlineTime {
  type: string;
  exact_time: number;
}

interface User {
  user_guid: string;
  first_name: string;
  phone: string;
  username: string;
  avatar_thumbnail: AvatarThumbnail;
  last_online: number;
  is_deleted: boolean;
  is_verified: boolean;
  online_time: OnlineTime;
}

interface LastMessage {
  message_id: string;
  type: string;
  text: string;
  author_object_guid: string;
  is_mine: boolean;
  author_title: string;
  author_type: string;
}

interface AbsObject {
  object_guid: string;
  type: string;
  first_name: string;
  avatar_thumbnail: AvatarThumbnail;
  is_verified: boolean;
  is_deleted: boolean;
}

interface Chat {
  object_guid: string;
  access: string[];
  count_unseen: number;
  is_mute: boolean;
  is_pinned: boolean;
  time_string: string;
  last_message: LastMessage;
  last_seen_my_mid: string;
  last_seen_peer_mid: string;
  status: string;
  time: number;
  abs_object: AbsObject;
  is_blocked: boolean;
  last_message_id: string;
  last_deleted_mid: string;
}

interface UserInfo {
  user: User;
  chat: Chat;
  timestamp: string;
  can_receive_call: boolean;
  can_video_call: boolean;
}

export { UserInfo };

export default UserInfo;
