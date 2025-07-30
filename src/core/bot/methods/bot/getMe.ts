import Bot from "../../bot";


async function getMe(this: Bot) {
  return await this.builder("getMe", {});
}

export default getMe;
