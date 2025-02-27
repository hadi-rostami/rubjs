import Client from "../..";

async function terminateSession(this: Client, session_key: string) {
  return await this.builder("terminateSession", { session_key });
}

export default terminateSession;
