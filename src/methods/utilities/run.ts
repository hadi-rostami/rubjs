import Client from "../..";
import Network from "../../network";

async function run(this: Client): Promise<void> {
  if (!this.initialize) {
    let timeout = setTimeout(async () => {
      await this.run();
      clearTimeout(timeout);
    }, 2000);
  } else await this.network.getUpdates();
}

export default run;
