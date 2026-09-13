import assert from "node:assert/strict";
import test from "node:test";
import { searchProducts } from "./productSearch.js";

const products = [
  { name: "Silver Ring", sku: "HP-RIN-1", category: "Rings", variants: [{ color: "Silver", size: "12" }] },
  { name: "Gold Necklace", sku: "HP-NEC-2", category: "Necklaces", variants: [{ color: "Rose Gold", size: "Adjustable" }] },
  { name: "Gold Ring", sku: "HP-RIN-3", category: "Rings", variants: [{ color: "Gold", size: "14" }] },
];

test("search matches multiple terms across name, SKU and product options", () => {
  assert.deepEqual(searchProducts(products, "ring silver 12"), [products[0]]);
  assert.deepEqual(searchProducts(products, "hp-nec adjustable"), [products[1]]);
});

test("search ranks matching names before option-only matches", () => {
  assert.deepEqual(searchProducts(products, "gold").map((product) => product.name), ["Gold Necklace", "Gold Ring"]);
});
