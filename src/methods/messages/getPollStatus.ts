import Client from "../..";

async function getPollStatus(this: Client, poll_id: string) {
  return await this.builder("getPollStatus", { poll_id });
}

export default getPollStatus;
