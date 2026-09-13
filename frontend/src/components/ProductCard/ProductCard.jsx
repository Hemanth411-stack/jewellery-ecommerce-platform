import { Eye, Heart, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { addToCart } from "../../features/cart/cartSlice.js";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../features/wishlist/wishlistSlice.js";

const formatPrice = (price) => {
  if (typeof price === "string") return price;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);
};

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const { isAuthenticated } = useSelector((state) => state.auth);
  const wishlistProducts = useSelector((state) => state.wishlist.products);
  const productId = product._id || product.id;
  const isWishlisted = wishlistProducts.some((item) => (item._id || item.id) === productId);
  const image = product.images?.[0] || product.image;
  const hasVariants = (product.variants || []).length > 0;
  const displayPrice = hasVariants ? Math.min(...product.variants.map((option) => option.price)) : product.price;
  const displayStock = hasVariants ? product.variants.reduce((total, option) => total + option.stock, 0) : product.stock;
  const summary = product.description || product.material || "";
  const hasDiscount = !hasVariants && Number(product.compareAtPrice) > Number(displayPrice);
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.compareAtPrice) - Number(displayPrice)) / Number(product.compareAtPrice)) * 100)
    : 0;
  const handleWishlistClick = () => {
    if (!productId) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (isWishlisted) {
      dispatch(removeFromWishlist(productId));
    } else {
      dispatch(addToWishlist(productId));
    }
  };

  const handleAddToCart = () => {
    if (!productId) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (hasVariants) {
      navigate(`/products/${productId}`);
      return;
    }

    dispatch(addToCart({ productId, quantity: 1 }));
    setCartMessage("Added to cart");
    window.setTimeout(() => setCartMessage(""), 2200);
  };

  return (
    <article className="group overflow-hidden rounded-md border border-ink/10 bg-white shadow-soft">
      <div className="relative aspect-[4/5] overflow-hidden bg-champagne">
        {productId ? (
          <Link to={`/products/${productId}`} className="block h-full w-full" aria-label={`View details for ${product.name}`}>
            <img
              src={image || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80"}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </Link>
        ) : (
          <img
            src={image || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80"}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-rosewood px-3 py-1 text-xs font-bold text-white">
            {discountPercent}% OFF
          </span>
        )}
        <div className="absolute right-2 top-2 flex flex-col gap-1.5 sm:right-3 sm:top-3 sm:gap-2">
          <button
            onClick={handleWishlistClick}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:text-rosewood sm:h-10 sm:w-10 ${
              isWishlisted ? "text-rosewood" : "text-ink"
            }`}
            aria-label={`${isWishlisted ? "Remove" : "Add"} ${product.name} ${isWishlisted ? "from" : "to"} wishlist`}
          >
            <Heart className="h-4 w-4 sm:h-[18px] sm:w-[18px]" fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            onClick={() => setIsQuickViewOpen(true)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition hover:text-bronze sm:h-10 sm:w-10"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </button>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="rounded-full bg-champagne px-2 py-1 text-[11px] font-semibold leading-none text-ink/65 sm:px-2.5 sm:text-xs">
            {product.category || "Jewellery"}
          </span>
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-ink sm:text-base">{product.name}</h3>
        {summary && <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink/60 sm:text-sm">{summary}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-base font-bold text-bronze sm:text-lg">{formatPrice(displayPrice)}</p>
          {hasDiscount && <p className="text-sm text-ink/35 line-through">{formatPrice(product.compareAtPrice)}</p>}
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-4 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-md bg-ink px-2 py-2 text-xs font-semibold text-white transition hover:bg-rosewood sm:min-h-10 sm:gap-2 sm:px-4 sm:text-sm"
        >
          <ShoppingBag className="h-4 w-4 sm:h-[17px] sm:w-[17px]" />
          {hasVariants ? "Choose Options" : "Add to Cart"}
        </button>
        {productId && (
          <Link
            to={`/products/${productId}`}
            className="mt-2 inline-flex min-h-9 w-full items-center justify-center rounded-md border border-ink/10 px-2 py-2 text-xs font-semibold text-ink transition hover:border-bronze sm:min-h-10 sm:px-4 sm:text-sm"
          >
            View Details
          </Link>
        )}
        {cartMessage && <p className="mt-2 text-center text-xs font-medium text-bronze">{cartMessage}</p>}
      </div>

      {isQuickViewOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/55 px-4 py-6" onClick={() => setIsQuickViewOpen(false)}>
          <div className="grid max-h-[90vh] w-full max-w-4xl overflow-auto rounded-md bg-white shadow-soft md:grid-cols-2" onClick={(event) => event.stopPropagation()}>
            <div className="aspect-square bg-champagne md:aspect-auto">
              <img
                src={image || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80"}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-bronze">{product.category || "Jewellery"}</p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-ink">{product.name}</h2>
                </div>
                <button type="button" onClick={() => setIsQuickViewOpen(false)} className="rounded-full border border-ink/10 p-2" aria-label="Close quick view">
                  <X size={18} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-bronze">{formatPrice(displayPrice)}</p>
                {hasDiscount && <p className="text-sm text-ink/35 line-through">{formatPrice(product.compareAtPrice)}</p>}
              </div>
              <p className="mt-4 text-sm leading-6 text-ink/65">
                {product.description || product.material || "A refined Himapriya jewellery piece crafted for everyday elegance and special occasions."}
              </p>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <p className="rounded-md bg-pearl px-4 py-3"><span className="font-semibold">Category:</span> {product.category || "Jewellery"}</p>
                <p className="rounded-md bg-pearl px-4 py-3"><span className="font-semibold">Stock:</span> {displayStock ?? "Available"}</p>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white"
                >
                  <ShoppingBag size={17} />
                  {hasVariants ? "Choose Options" : "Add to Cart"}
                </button>
                <button
                  type="button"
                  onClick={handleWishlistClick}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink"
                >
                  <Heart size={17} fill={isWishlisted ? "currentColor" : "none"} />
                  {isWishlisted ? "Saved" : "Wishlist"}
                </button>
              </div>
              {productId && (
                <Link
                  to={`/products/${productId}`}
                  onClick={() => setIsQuickViewOpen(false)}
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-champagne px-5 py-2.5 text-sm font-semibold text-ink"
                >
                  View Full Details
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default ProductCard;
