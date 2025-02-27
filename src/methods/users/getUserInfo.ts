import Client from '../..';
import UserInfo from '../../types/users';

async function getUserInfo(
  this: Client,
  user_guid: string | null = null
): Promise<UserInfo> {
  const result: UserInfo = await this.builder(
    "getUserInfo",
    user_guid ? { user_guid } : {},
    this.auth ? false : true
  );

  return result;
}
export default getUserInfo;