interface SendCode {
  phone_code_hash: string;
  status: string;
  code_digits_count: number;
  has_confirmed_recovery_email: boolean;
  no_recovery_alert: string;
  send_type: string;
  hint_pass_key: string;
}

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
  last_name: string;
  phone: string;
  username: string;
  avatar_thumbnail: AvatarThumbnail;
  last_online: number;
  bio: string | boolean;
  is_deleted: boolean;
  is_verified: boolean;
  online_time: OnlineTime;
}

interface SignIn {
  status: string;
  auth: string;
  user: User;
  timestamp: number;
}

export { SignIn, SendCode };

export default SendCode;
