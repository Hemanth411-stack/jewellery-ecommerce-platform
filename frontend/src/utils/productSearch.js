const normalize = (value) => String(value ?? "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase();

export const searchProducts = (products, query) => {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return products;

  return products
    .map((product) => {
      const name = normalize(product.name);
      const sku = normalize(product.sku);
      const category = normalize(product.category);
      const options = (product.variants || []).flatMap((option) => [option.color, option.size]);
      const text = normalize([name, sku, category, product.description, product.shortDescription,
        product.material, product.metal, product.gemstone, ...options].join(" "));
      if (!terms.every((term) => text.includes(term))) return null;

      const score = terms.reduce((total, term) => total +
        (name.startsWith(term) ? 8 : name.includes(term) ? 5 : 0) +
        (sku.startsWith(term) ? 7 : 0) +
        (category.includes(term) ? 3 : 0), 0);
      return { product, score };
    })
    .filter(Boolean)
    .sort((first, second) => second.score - first.score)
    .map(({ product }) => product);
};
