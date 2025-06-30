import Client from "../../client";

async function actionOnStickerSet(
  this: Client,
  sticker_set_id: string,
  action: "Add" | "Remove"
) {
  if (!["Add", "Remove"].includes(action)) {
    console.warn('The `action` argument can only be in `("Add", "Remove")`.  Using default "Add".');
    action = "Add"
  }

  return await this.builder("actionOnStickerSet", { sticker_set_id, action });
}

export default actionOnStickerSet;
