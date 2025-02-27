import Client from "../..";

async function addLiveComment(
  this: Client,
  text: string,
  access_token: string,
  live_id: string
) {
  return await this.builder("addLiveComment", { access_token, live_id, text });
}

export default addLiveComment;
