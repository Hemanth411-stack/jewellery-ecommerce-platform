export const getCartItemPrice = (item) =>
  item.variantId ? (item.variant?.price ?? item.product.price) : item.product.price;
