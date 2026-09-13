import { Edit2, ImagePlus, Plus, Search, Trash2, X } from "lucide-react";
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
import { searchProducts } from "../../utils/productSearch.js";

const emptyForm = {
  name: "",
  category: "Rings",
  description: "",
  price: "",
  compareAtPrice: "",
  stock: "",
  variants: [],
  variantColor: "",
  variantSize: "",
  variantPrice: "",
  variantStock: "",
  images: [],
  imageInput: "",
  video: "",
  videoInput: "",
  youtubeUrl: "",
  isFeatured: false,
  isActive: true,
};

const categories = ["Rings", "Necklaces", "Earrings", "Bracelets", "Bangles", "Pendants", "Anklets"];

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
  const [catalogueSearch, setCatalogueSearch] = useState("");
  const visibleProducts = useMemo(() => searchProducts(products, catalogueSearch), [products, catalogueSearch]);

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
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    const availableSlots = 5 - formData.images.length;

    if (availableSlots <= 0) {
      setLocalError("You can upload a maximum of 5 images.");
      event.target.value = "";
      return;
    }

    files.slice(0, availableSlots).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((current) => ({
          ...current,
          images: current.images.length < 5 ? [...current.images, reader.result] : current.images,
        }));
      };
      reader.readAsDataURL(file);
    });

    if (files.length > availableSlots) {
      setLocalError("Only 5 images are allowed. Extra images were skipped.");
    } else {
      setLocalError("");
    }

    event.target.value = "";
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((current) => ({
        ...current,
        video: reader.result,
      }));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const addImageUrl = () => {
    if (!formData.imageInput.trim()) return;

    if (formData.images.length >= 5) {
      setLocalError("You can upload a maximum of 5 images.");
      return;
    }

    setFormData((current) => ({
      ...current,
      images: [...current.images, current.imageInput.trim()],
      imageInput: "",
    }));
    setLocalError("");
  };

  const addVideoUrl = () => {
    if (!formData.videoInput.trim()) return;

    setFormData((current) => ({
      ...current,
      video: current.videoInput.trim(),
      videoInput: "",
    }));
    setLocalError("");
  };

  const removeImage = (index) => {
    setFormData((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const addVariant = () => {
    if (!formData.variantColor.trim() && !formData.variantSize.trim()) {
      setLocalError("Add a color or size for the option.");
      return;
    }

    if (formData.variantPrice === "" || !Number.isFinite(Number(formData.variantPrice)) || Number(formData.variantPrice) < 0 ||
      formData.variantStock === "" || !Number.isInteger(Number(formData.variantStock)) || Number(formData.variantStock) < 0) {
      setLocalError("Option price and stock are required and must be valid.");
      return;
    }

    setFormData((current) => ({
      ...current,
      variants: [
        ...current.variants,
        {
          color: current.variantColor.trim(),
          size: current.variantSize.trim(),
          price: Number(current.variantPrice),
          stock: Number(current.variantStock) || 0,
        },
      ],
      variantColor: "",
      variantSize: "",
      variantPrice: "",
      variantStock: "",
    }));
    setLocalError("");
  };

  const removeVariant = (index) => {
    setFormData((current) => ({
      ...current,
      variants: current.variants.filter((_, variantIndex) => variantIndex !== index),
    }));
  };

  const updateVariant = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              [field]: field === "price" || field === "stock" ? Number(value) || 0 : value,
            }
          : variant
      ),
    }));
  };

  const validate = () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      setLocalError("Name and description are required.");
      return false;
    }

    if (formData.variants.length) {
      if (formData.variants.some((option) => (!option.color.trim() && !option.size.trim()) ||
        option.price === "" || !Number.isFinite(Number(option.price)) || Number(option.price) < 0 ||
        option.stock === "" || !Number.isInteger(Number(option.stock)) || Number(option.stock) < 0)) {
        setLocalError("Every option needs a color or size, a price, and a valid stock count.");
        return false;
      }
    } else if (formData.price === "" || !Number.isFinite(Number(formData.price)) || Number(formData.price) < 0 ||
      formData.stock === "" || !Number.isInteger(Number(formData.stock)) || Number(formData.stock) < 0) {
      setLocalError("Price and stock are required when there are no options.");
      return false;
    }

    if (!formData.category.trim()) {
      setLocalError("Category is required.");
      return false;
    }

    setLocalError("");
    return true;
  };

  const buildPayload = () => ({
    name: formData.name,
    category: formData.category,
    description: formData.description,
    price: formData.variants.length ? Math.min(...formData.variants.map((option) => Number(option.price))) : Number(formData.price),
    compareAtPrice: formData.variants.length ? 0 : Number(formData.compareAtPrice) || 0,
    stock: formData.variants.length ? formData.variants.reduce((total, option) => total + Number(option.stock), 0) : Number(formData.stock),
    variants: formData.variants,
    images: formData.images,
    video: formData.video,
    youtubeUrl: formData.youtubeUrl,
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
      category: product.category || "Rings",
      description: product.description || "",
      price: product.price || "",
      compareAtPrice: product.compareAtPrice || "",
      stock: product.stock || "",
      variants: product.variants || [],
      images: product.images || [],
      video: product.video || "",
      youtubeUrl: product.youtubeUrl || "",
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
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Category</span>
              <select
                value={categorySuggestions.includes(formData.category) ? formData.category : "__new__"}
                onChange={(event) => {
                  setFormData((current) => ({
                    ...current,
                    category: event.target.value === "__new__" ? "" : event.target.value,
                  }));
                }}
                className="w-full rounded-md border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-bronze"
              >
                {categorySuggestions.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
                <option value="__new__">Create new category</option>
              </select>
              {!categorySuggestions.includes(formData.category) && (
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-3 w-full rounded-md border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-bronze"
                  placeholder="New category name"
                />
              )}
            </label>
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
            {formData.variants.length === 0 ? <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Price" name="price" type="number" min="0" value={formData.price} onChange={handleChange} placeholder="42999" />
              <Input label="Compare Price" name="compareAtPrice" type="number" min="0" value={formData.compareAtPrice} onChange={handleChange} placeholder="48999" />
              <Input label="Stock" name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} placeholder="12" />
            </div> : <p className="rounded-md bg-champagne px-4 py-3 text-sm text-ink/70">Price and stock come from the options below. No separate base or compare price is needed.</p>}

            <div className="rounded-md border border-ink/10 bg-pearl p-4">
              <p className="mb-3 text-sm font-semibold text-ink">Color / Size Pricing</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Color" name="variantColor" value={formData.variantColor} onChange={handleChange} placeholder="Gold" />
                <Input label="Size" name="variantSize" value={formData.variantSize} onChange={handleChange} placeholder="12 / Adjustable" />
                <Input label="Option Price" name="variantPrice" type="number" min="0" value={formData.variantPrice} onChange={handleChange} placeholder="44999" />
                <Input label="Option Stock" name="variantStock" type="number" min="0" value={formData.variantStock} onChange={handleChange} placeholder="5" />
              </div>
              <Button type="button" variant="secondary" onClick={addVariant} className="mt-3">
                Add Option
              </Button>
              {formData.variants.length > 0 && (
                <div className="mt-4 space-y-3">
                  {formData.variants.map((variant, index) => (
                    <div key={variant._id || `${variant.color}-${variant.size}-${index}`} className="rounded-md bg-white p-3 text-sm">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          label="Color"
                          value={variant.color || ""}
                          onChange={(event) => updateVariant(index, "color", event.target.value)}
                          placeholder="Gold"
                        />
                        <Input
                          label="Size"
                          value={variant.size || ""}
                          onChange={(event) => updateVariant(index, "size", event.target.value)}
                          placeholder="12 / Adjustable"
                        />
                        <Input
                          label="Option Price"
                          type="number"
                          min="0"
                          value={variant.price ?? ""}
                          onChange={(event) => updateVariant(index, "price", event.target.value)}
                          placeholder="44999"
                        />
                        <Input
                          label="Option Stock"
                          type="number"
                          min="0"
                          value={variant.stock ?? ""}
                          onChange={(event) => updateVariant(index, "stock", event.target.value)}
                          placeholder="5"
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="font-medium text-ink/60">Option {index + 1} - {formatCurrency(variant.price)}</span>
                        <button type="button" onClick={() => removeVariant(index)} className="inline-flex items-center gap-1 text-red-600" aria-label="Remove option">
                          <X size={16} />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-md border border-ink/10 bg-pearl p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <ImagePlus size={18} />
                Product Images ({formData.images.length}/5)
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
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
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

            <div className="rounded-md border border-ink/10 bg-pearl p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <ImagePlus size={18} />
                Product Video
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input name="videoInput" value={formData.videoInput} onChange={handleChange} placeholder="Video URL or base64 string" />
                <Button type="button" variant="secondary" onClick={addVideoUrl}>
                  Add Video
                </Button>
              </div>
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink">
                <Plus size={17} />
                Upload Video
                <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
              </label>
              {formData.video && (
                <div className="mt-4 rounded-md bg-white p-3">
                  <video src={formData.video} controls className="max-h-52 w-full rounded-md bg-ink" />
                  <button type="button" onClick={() => setFormData((current) => ({ ...current, video: "" }))} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-red-600">
                    <X size={16} />
                    Remove video
                  </button>
                </div>
              )}
            </div>

            <Input label="YouTube Link" name="youtubeUrl" value={formData.youtubeUrl} onChange={handleChange} placeholder="https://www.youtube.com/watch?v=..." />

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
            <label className="relative mt-4 block">
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
              <input type="search" value={catalogueSearch} onChange={(event) => setCatalogueSearch(event.target.value)} placeholder="Search by name, SKU, category or option" aria-label="Search admin products" className="w-full rounded-md border border-ink/15 bg-pearl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-bronze" />
            </label>
            <p className="mt-2 text-xs text-ink/50">Showing {visibleProducts.length} of {products.length} products</p>
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
                  {visibleProducts.map((product) => (
                    <tr key={product._id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-md bg-champagne">
                            {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-semibold text-ink">{product.name}</p>
                            {product.variants?.length > 0 && <p className="text-xs text-ink/50">{product.variants.length} option{product.variants.length === 1 ? "" : "s"}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-ink/65">{product.category}</td>
                      <td className="px-5 py-4 font-semibold">{formatCurrency(product.variants?.length ? Math.min(...product.variants.map((option) => option.price)) : product.price)}</td>
                      <td className="px-5 py-4">{product.variants?.length ? product.variants.reduce((total, option) => total + option.stock, 0) : product.stock}</td>
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
                  {visibleProducts.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-5 py-12 text-center text-ink/55">
                        {products.length ? "No products match your search." : "No products yet. Add your first jewellery listing."}
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
