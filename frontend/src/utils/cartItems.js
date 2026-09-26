export const getAvailableCartItems = (items) =>
  Array.isArray(items) ? items.filter((item) => item?.product?._id) : [];

export const getCartItemPrice = (item) =>
  item.variantId ? (item.variant?.price ?? item.product.price) : item.product.price;
