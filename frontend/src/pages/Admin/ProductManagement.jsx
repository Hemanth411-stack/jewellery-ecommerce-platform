import { Edit2, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import Loader from "../../components/common/Loader.jsx";
import {
  clearProductStatus,
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from "../../features/products/productSlice.js";

const emptyForm = {
  name: "",
  slug: "",
  sku: "",
  category: "Rings",
  collection: "",
  description: "",
  shortDescription: "",
  price: "",
  compareAtPrice: "",
  stock: "",
  metal: "Gold",
  metalPurity: "",
  gemstone: "",
  weightInGrams: "",
  size: "",
  color: "",
  craftsmanship: "",
  careInstructions: "",
  tags: "",
  images: [],
  imageInput: "",
  isFeatured: false,
  isActive: true,
};

const categories = ["Rings", "Necklaces", "Earrings", "Bracelets", "Bangles", "Pendants", "Anklets"];
const metals = ["Gold", "Rose Gold", "White Gold", "Silver", "Platinum", "Diamond"];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

function ProductManagement() {
  const dispatch = useDispatch();
  const { products, isLoading, isSaving, error, message } = useSelector((state) => state.products);
  const [formData, setFormData] = useState(emptyForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [localError, setLocalError] = useState("");

  const activeProducts = useMemo(() => products.filter((product) => product.isActive).length, [products]);
  const featuredProducts = useMemo(() => products.filter((product) => product.isFeatured).length, [products]);
  const categorySuggestions = useMemo(() => {
    const productCategories = products.map((product) => product.category).filter(Boolean);
    return [...new Set([...categories, ...productCategories])];
  }, [products]);

  useEffect(() => {
    dispatch(fetchProducts({ includeInactive: true }));

    return () => {
      dispatch(clearProductStatus());
    };
  }, [dispatch]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((current) => ({
        ...current,
        images: [...current.images, reader.result],
      }));
    };
    reader.readAsDataURL(file);
  };

  const addImageUrl = () => {
    if (!formData.imageInput.trim()) return;

    setFormData((current) => ({
      ...current,
      images: [...current.images, current.imageInput.trim()],
      imageInput: "",
    }));
  };

  const removeImage = (index) => {
    setFormData((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const validate = () => {
    if (!formData.name.trim() || !formData.sku.trim() || !formData.description.trim()) {
      setLocalError("Name, SKU, and description are required.");
      return false;
    }

    if (!formData.price || Number(formData.price) < 0 || !formData.stock || Number(formData.stock) < 0) {
      setLocalError("Price and stock are required and must be positive.");
      return false;
    }

    if (!formData.metal.trim() || !formData.category.trim()) {
      setLocalError("Category and metal are required.");
      return false;
    }

    setLocalError("");
    return true;
  };

  const buildPayload = () => ({
    name: formData.name,
    slug: formData.slug,
    sku: formData.sku,
    category: formData.category,
    collection: formData.collection,
    description: formData.description,
    shortDescription: formData.shortDescription,
    price: Number(formData.price),
    compareAtPrice: Number(formData.compareAtPrice) || 0,
    stock: Number(formData.stock),
    metal: formData.metal,
    metalPurity: formData.metalPurity,
    gemstone: formData.gemstone,
    weightInGrams: Number(formData.weightInGrams) || 0,
    size: formData.size,
    color: formData.color,
    craftsmanship: formData.craftsmanship,
    careInstructions: formData.careInstructions,
    tags: formData.tags,
    images: formData.images,
    isFeatured: formData.isFeatured,
    isActive: formData.isActive,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = buildPayload();

    try {
      if (editingProductId) {
        await dispatch(updateProduct({ productId: editingProductId, productData: payload })).unwrap();
      } else {
        await dispatch(createProduct(payload)).unwrap();
      }

      setFormData(emptyForm);
      setEditingProductId(null);
    } catch (saveError) {
      setLocalError(saveError);
    }
  };

  const handleEdit = (product) => {
    setEditingProductId(product._id);
    setFormData({
      ...emptyForm,
      name: product.name || "",
      slug: product.slug || "",
      sku: product.sku || "",
      category: product.category || "Rings",
      collection: product.collection || "",
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      price: product.price || "",
      compareAtPrice: product.compareAtPrice || "",
      stock: product.stock || "",
      metal: product.metal || "Gold",
      metalPurity: product.metalPurity || "",
      gemstone: product.gemstone || "",
      weightInGrams: product.weightInGrams || "",
      size: product.size || "",
      color: product.color || "",
      craftsmanship: product.craftsmanship || "",
      careInstructions: product.careInstructions || "",
      tags: product.tags?.join(", ") || "",
      images: product.images || [],
      isFeatured: Boolean(product.isFeatured),
      isActive: Boolean(product.isActive),
    });
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingProductId(null);
    setLocalError("");
  };

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink/55">Total Products</p>
          <p className="mt-2 text-3xl font-bold text-ink">{products.length}</p>
        </div>
        <div className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink/55">Active Listings</p>
          <p className="mt-2 text-3xl font-bold text-ink">{activeProducts}</p>
        </div>
        <div className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink/55">Featured</p>
          <p className="mt-2 text-3xl font-bold text-ink">{featuredProducts}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form className="rounded-md border border-ink/10 bg-white p-5 shadow-soft" onSubmit={handleSubmit}>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-bronze">Catalogue</p>
              <h2 className="mt-1 font-display text-2xl font-bold">{editingProductId ? "Edit Product" : "Add Product"}</h2>
            </div>
            {editingProductId && (
              <button type="button" className="rounded-md border border-ink/10 p-2" onClick={resetForm} aria-label="Cancel edit">
                <X size={18} />
              </button>
            )}
          </div>

          {(localError || error || message) && (
            <div
              className={`mb-5 rounded-md px-4 py-3 text-sm ${
                localError || error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
              }`}
            >
              {localError || error || message}
            </div>
          )}

          <div className="space-y-4">
            <Input label="Product Name" name="name" value={formData.name} onChange={handleChange} placeholder="Diamond Solitaire Ring" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="SKU" name="sku" value={formData.sku} onChange={handleChange} placeholder="HP-RNG-001" />
              <Input label="Slug" name="slug" value={formData.slug} onChange={handleChange} placeholder="auto if empty" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink">Category</span>
                <input
                  list="category-options"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-md border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-bronze"
                  placeholder="Choose or type category"
                />
                <datalist id="category-options">
                  {categorySuggestions.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </label>
              <Input label="Collection" name="collection" value={formData.collection} onChange={handleChange} placeholder="Wedding Edit" />
            </div>
            <Input label="Short Description" name="shortDescription" value={formData.shortDescription} onChange={handleChange} placeholder="18K gold with brilliant diamonds" />
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Description</span>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-md border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-bronze"
                placeholder="Detailed product story, finish, setting, and usage."
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Price" name="price" type="number" min="0" value={formData.price} onChange={handleChange} placeholder="42999" />
              <Input label="Compare Price" name="compareAtPrice" type="number" min="0" value={formData.compareAtPrice} onChange={handleChange} placeholder="48999" />
              <Input label="Stock" name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} placeholder="12" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink">Metal</span>
                <select name="metal" value={formData.metal} onChange={handleChange} className="w-full rounded-md border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-bronze">
                  {metals.map((metal) => (
                    <option key={metal}>{metal}</option>
                  ))}
                </select>
              </label>
              <Input label="Metal Purity" name="metalPurity" value={formData.metalPurity} onChange={handleChange} placeholder="18K / 22K / 925" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Gemstone" name="gemstone" value={formData.gemstone} onChange={handleChange} placeholder="Diamond" />
              <Input label="Weight (grams)" name="weightInGrams" type="number" min="0" step="0.01" value={formData.weightInGrams} onChange={handleChange} placeholder="8.5" />
              <Input label="Size" name="size" value={formData.size} onChange={handleChange} placeholder="Adjustable / 12" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Color" name="color" value={formData.color} onChange={handleChange} placeholder="Champagne Gold" />
              <Input label="Craftsmanship" name="craftsmanship" value={formData.craftsmanship} onChange={handleChange} placeholder="Hand finished" />
            </div>
            <Input label="Care Instructions" name="careInstructions" value={formData.careInstructions} onChange={handleChange} placeholder="Store separately and avoid perfume contact" />
            <Input label="Tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="bridal, premium, gifting" />

            <div className="rounded-md border border-ink/10 bg-pearl p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <ImagePlus size={18} />
                Product Images
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input name="imageInput" value={formData.imageInput} onChange={handleChange} placeholder="Image URL or base64 string" />
                <Button type="button" variant="secondary" onClick={addImageUrl}>
                  Add URL
                </Button>
              </div>
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink">
                <Plus size={17} />
                Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {formData.images.map((image, index) => (
                    <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden rounded-md bg-white">
                      <img src={image} alt="Product preview" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removeImage(index)} className="absolute right-1 top-1 rounded-full bg-white p-1 text-red-600" aria-label="Remove image">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-md border border-ink/10 px-4 py-3 text-sm font-medium">
                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="h-4 w-4 accent-bronze" />
                Featured product
              </label>
              <label className="flex items-center gap-3 rounded-md border border-ink/10 px-4 py-3 text-sm font-medium">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 accent-bronze" />
                Active listing
              </label>
            </div>
            <Button type="submit" isLoading={isSaving} className="w-full">
              {editingProductId ? "Update Product" : "Save Product"}
            </Button>
          </div>
        </form>

        <div className="rounded-md border border-ink/10 bg-white shadow-soft">
          <div className="border-b border-ink/10 px-5 py-4">
            <h2 className="font-display text-2xl font-bold">Products</h2>
            <p className="mt-1 text-sm text-ink/55">Manage active, draft, and featured jewellery listings.</p>
          </div>

          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-champagne text-xs uppercase tracking-[0.16em] text-ink/55">
                  <tr>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-md bg-champagne">
                            {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-semibold text-ink">{product.name}</p>
                            <p className="text-xs text-ink/50">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-ink/65">{product.category}</td>
                      <td className="px-5 py-4 font-semibold">{formatCurrency(product.price)}</td>
                      <td className="px-5 py-4">{product.stock}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.isActive ? "bg-green-50 text-green-700" : "bg-ink/5 text-ink/50"}`}>
                          {product.isActive ? "Active" : "Draft"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => handleEdit(product)} className="rounded-md border border-ink/10 p-2 text-ink/70 hover:text-ink" aria-label={`Edit ${product.name}`}>
                            <Edit2 size={16} />
                          </button>
                          <button type="button" onClick={() => dispatch(deleteProduct(product._id))} className="rounded-md border border-ink/10 p-2 text-red-600 hover:bg-red-50" aria-label={`Delete ${product.name}`}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-5 py-12 text-center text-ink/55">
                        No products yet. Add your first jewellery listing.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProductManagement;
