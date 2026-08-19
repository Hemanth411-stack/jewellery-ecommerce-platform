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
  const material = product.shortDescription || product.material || [product.metal, product.metalPurity].filter(Boolean).join(" ");
  const hasDiscount = Number(product.compareAtPrice) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
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

    dispatch(addToCart({ productId, quantity: 1 }));
    setCartMessage("Added to cart");
    window.setTimeout(() => setCartMessage(""), 2200);
  };

  return (
    <article className="group overflow-hidden rounded-md border border-ink/10 bg-white shadow-soft">
      <div className="relative aspect-[4/5] overflow-hidden bg-champagne">
        <img
          src={image || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80"}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-rosewood px-3 py-1 text-xs font-bold text-white">
            {discountPercent}% OFF
          </span>
        )}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            onClick={handleWishlistClick}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:text-rosewood ${
              isWishlisted ? "text-rosewood" : "text-ink"
            }`}
            aria-label={`${isWishlisted ? "Remove" : "Add"} ${product.name} ${isWishlisted ? "from" : "to"} wishlist`}
          >
            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            onClick={() => setIsQuickViewOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition hover:text-bronze"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye size={18} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="rounded-full bg-champagne px-2.5 py-1 text-xs font-semibold text-ink/65">
            {product.category || "Jewellery"}
          </span>
        </div>
        <h3 className="text-base font-semibold text-ink">{product.name}</h3>
        <p className="mt-1 text-sm text-ink/60">{material}</p>
        <div className="mt-3 flex items-center gap-2">
          <p className="text-lg font-bold text-bronze">{formatPrice(product.price)}</p>
          {hasDiscount && <p className="text-sm text-ink/35 line-through">{formatPrice(product.compareAtPrice)}</p>}
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-rosewood"
        >
          <ShoppingBag size={17} />
          Add to Cart
        </button>
        {productId && (
          <Link
            to={`/products/${productId}`}
            className="mt-2 inline-flex min-h-10 w-full items-center justify-center rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-bronze"
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
                <p className="text-2xl font-bold text-bronze">{formatPrice(product.price)}</p>
                {hasDiscount && <p className="text-sm text-ink/35 line-through">{formatPrice(product.compareAtPrice)}</p>}
              </div>
              <p className="mt-4 text-sm leading-6 text-ink/65">
                {product.description || product.shortDescription || product.material || "A refined Himapriya jewellery piece crafted for everyday elegance and special occasions."}
              </p>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <p className="rounded-md bg-pearl px-4 py-3"><span className="font-semibold">Metal:</span> {product.metal || "Premium finish"}</p>
                <p className="rounded-md bg-pearl px-4 py-3"><span className="font-semibold">Purity:</span> {product.metalPurity || "Selected quality"}</p>
                <p className="rounded-md bg-pearl px-4 py-3"><span className="font-semibold">Gemstone:</span> {product.gemstone || "As designed"}</p>
                <p className="rounded-md bg-pearl px-4 py-3"><span className="font-semibold">Stock:</span> {product.stock ?? "Available"}</p>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white"
                >
                  <ShoppingBag size={17} />
                  Add to Cart
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
