export const omitUnchangedMedia = (payload, existingProduct) => {
  const update = { ...payload };
  const existingImages = existingProduct.images || [];
  if (Array.isArray(update.images) && update.images.length === existingImages.length &&
      update.images.every((image, index) => image === existingImages[index])) delete update.images;
  if (update.video === (existingProduct.video || "")) delete update.video;
  return update;
};
