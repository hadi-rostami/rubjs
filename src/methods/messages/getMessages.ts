import Client from "../..";

async function getMessages(
  this: Client,
  object_guid: string,
  filter_type: string,
  max_id: string,
  limit: string,
  sort: "FromMin" | "FromMax" = "FromMax"
) {
  return await this.builder("getMessages", {
    object_guid,
    filter_type,
    max_id,
    limit,
    sort,
  });
}

export default getMessages;
