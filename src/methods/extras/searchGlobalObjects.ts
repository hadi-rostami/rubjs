import Client from "../..";

async function searchGlobalObjects(this: Client, search_text: string) {
  return await this.builder("searchGlobalObjects", { search_text });
}

export default searchGlobalObjects;
