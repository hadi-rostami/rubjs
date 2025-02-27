import Client from "../..";

async function actionOnStickerSet(
  this: Client,
  sticker_set_id: string,
  action: "Add" | "Remove"
) {
  if (!["Add", "Remove"].includes(action))
    throw new Error(
      'The `action` argument can only be in `("Add", "Remove")`.'
    );

  return await this.builder("actionOnStickerSet", { sticker_set_id, action });
}

export default actionOnStickerSet;
