import { ExternalLink, Heart, Maximize2, Minus, PlayCircle, Plus, RotateCcw, ShieldCheck, ShoppingBag, Star, Truck, X, Youtube, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";
import ProductCard from "../../components/ProductCard/ProductCard.jsx";
import { addToCart } from "../../features/cart/cartSlice.js";
import {
  fetchProductById,
  fetchRelatedProducts,
} from "../../features/products/productSlice.js";
import {
  clearReviewStatus,
  fetchProductReviews,
} from "../../features/reviews/reviewSlice.js";
import {
  addToWishlist,
  fetchWishlist,
  removeFromWishlist,
} from "../../features/wishlist/wishlistSlice.js";

const fallbackImage = "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);

function QuantityStepper({ quantity, onDecrease, onIncrease, compact = false }) {
  return (
    <div className={compact ? "shrink-0" : ""}>
      {!compact && <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">Quantity</p>}
      <div className="inline-flex h-9 items-center rounded-md border border-ink/10 bg-pearl shadow-sm">
        <button
          type="button"
          onClick={onDecrease}
          className="flex h-full w-8 items-center justify-center rounded-l-md text-ink/65 transition hover:bg-champagne hover:text-ink"
          aria-label="Decrease quantity"
        >
          <Minus size={13} />
        </button>
        <span className="min-w-8 border-x border-ink/10 px-2 text-center text-sm font-semibold text-ink">{quantity}</span>
        <button
          type="button"
          onClick={onIncrease}
          className="flex h-full w-8 items-center justify-center rounded-r-md text-ink/65 transition hover:bg-champagne hover:text-ink"
          aria-label="Increase quantity"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

function PurchaseActions({
  quantity,
  onDecrease,
  onIncrease,
  onAddToCart,
  cartMessage,
  compact = false,
}) {
  return (
    <div className={compact ? "" : "rounded-md border border-ink/10 bg-white p-3 shadow-soft"}>
      {cartMessage && <p className="mb-3 text-sm font-semibold text-bronze">{cartMessage}</p>}
      <div className={compact ? "flex items-center gap-3" : "flex flex-wrap items-end gap-3"}>
        <QuantityStepper quantity={quantity} onDecrease={onDecrease} onIncrease={onIncrease} compact={compact} />
        <div className={compact ? "flex min-w-0 flex-1" : "flex min-w-0 flex-1"}>
          <Button
            type="button"
            onClick={onAddToCart}
            className={compact ? "min-h-10 min-w-0 flex-1 px-3 py-2 text-sm" : "min-h-9 flex-1 px-4 py-2 text-sm"}
          >
            <ShoppingBag size={16} />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedProduct, relatedProducts, isLoading, error } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const wishlistProducts = useSelector((state) => state.wishlist.products);
  const {
    reviews,
    averageRating,
    totalReviews,
    isLoading: reviewsLoading,
    error: reviewError,
    message: reviewMessage,
  } = useSelector((state) => state.reviews);
  const [selectedImage, setSelectedImage] = useState("");
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [searchParams] = useSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState("");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const images = useMemo(() => {
    const productImages = selectedProduct?.images?.length ? selectedProduct.images : [];
    return productImages.length > 0 ? productImages : [fallbackImage];
  }, [selectedProduct]);

  const isWishlisted = wishlistProducts.some((product) => product._id === selectedProduct?._id);
  const variants = useMemo(() => selectedProduct?.variants || [], [selectedProduct]);
  const selectedVariant = variants.find((variant) => variant._id === selectedVariantId);
  const activePrice = selectedVariant?.price ?? selectedProduct?.price;
  const hasReviews = Number(totalReviews) > 0;
  const description = selectedProduct?.description || "";
  const canToggleDescription = description.length > 140;
  const hasDiscount = variants.length === 0 && Number(selectedProduct?.compareAtPrice) > Number(activePrice);
  const discountPercent = hasDiscount
    ? Math.round(((Number(selectedProduct.compareAtPrice) - Number(activePrice)) / Number(selectedProduct.compareAtPrice)) * 100)
    : 0;

  useEffect(() => {
    dispatch(fetchProductById(id));
    dispatch(fetchRelatedProducts(id));
    dispatch(fetchProductReviews(id));
    dispatch(clearReviewStatus());
  }, [dispatch, id]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    setSelectedImage(images[0]);
  }, [images]);

  useEffect(() => {
    const lowestPriceOption = variants.reduce((lowest, option) =>
      !lowest || option.price < lowest.price ? option : lowest, null);
    const requestedOption = variants.find((option) => option._id === searchParams.get("variant"));
    setSelectedVariantId(requestedOption?._id || lowestPriceOption?._id || "");
  }, [selectedProduct?._id, variants, searchParams]);

  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (isWishlisted) {
      dispatch(removeFromWishlist(selectedProduct._id));
    } else {
      dispatch(addToWishlist(selectedProduct._id));
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    dispatch(addToCart({ productId: selectedProduct._id, quantity, variantId: selectedVariantId }));
    setCartMessage(`Added ${quantity} item${quantity > 1 ? "s" : ""} to cart.`);
    window.setTimeout(() => setCartMessage(""), 2500);
  };

  const decreaseQuantity = () => setQuantity((value) => Math.max(1, value - 1));
  const increaseQuantity = () => setQuantity((value) => value + 1);

  const openImageViewer = () => {
    setImageZoom(1);
    setIsImageViewerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !selectedProduct) {
    return (
      <section className="px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-ink">Product not found</h1>
        <p className="mt-3 text-sm text-ink/60">{error || "This product is unavailable."}</p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white">
          Back to store
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="px-4 pb-32 pt-10 sm:px-6 lg:px-8 lg:pb-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 text-sm text-ink/55">
            <Link to="/" className="hover:text-bronze">Home</Link> / <span>{selectedProduct.category}</span> / <span className="text-ink">{selectedProduct.name}</span>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <div className="relative grid gap-4 md:grid-cols-[96px_1fr]">
                <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-champagne ${
                        selectedImage === image ? "border-bronze" : "border-ink/10"
                      }`}
                    >
                      <img src={image} alt={`${selectedProduct.name} ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={openImageViewer}
                  className="group relative order-1 aspect-square overflow-hidden rounded-md bg-champagne text-left shadow-soft md:order-2"
                  aria-label={`Open full image for ${selectedProduct.name}`}
                >
                  <img src={selectedImage || images[0]} alt={selectedProduct.name} className="h-full w-full object-cover" />
                  <span className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition group-hover:text-bronze">
                    <Maximize2 size={18} />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleWishlistClick}
                  className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-ink shadow-sm transition hover:bg-champagne hover:text-rosewood"
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-rosewood" : ""} />
                </button>
              </div>

            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedProduct.isFeatured && (
                  <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white">
                    Bestseller
                  </span>
                )}
                {hasDiscount && (
                  <span className="rounded-full bg-rosewood px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white">
                    {discountPercent}% off
                  </span>
                )}
              </div>

              <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-ink lg:text-5xl">{selectedProduct.name}</h1>
              <div className="mt-6 flex flex-wrap items-end gap-3">
                <p className="text-3xl font-bold text-bronze">{formatPrice(activePrice)}</p>
                {hasDiscount && <p className="text-lg text-ink/35 line-through">{formatPrice(selectedProduct.compareAtPrice)}</p>}
              </div>

              {selectedProduct.youtubeUrl && (
                <a
                  href={selectedProduct.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  <Youtube size={18} />
                  Watch on YouTube
                  <ExternalLink size={15} />
                </a>
              )}

              {variants.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">Choose Color / Size</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {variants.map((variant) => (
                      <button
                        key={variant._id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant._id)}
                        className={`rounded-md border px-4 py-3 text-left text-sm transition ${
                          selectedVariantId === variant._id
                            ? "border-bronze bg-champagne text-ink"
                            : "border-ink/10 bg-white text-ink/70 hover:border-bronze"
                        }`}
                      >
                        <span className="flex flex-wrap gap-2">
                          {variant.color && (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink shadow-sm">
                              Color: {variant.color}
                            </span>
                          )}
                          {variant.size && (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink shadow-sm">
                              Size: {variant.size}
                            </span>
                          )}
                        </span>
                        <span className="mt-3 inline-flex rounded-full bg-bronze px-3 py-1 text-xs font-bold text-white">
                          Price: {formatPrice(variant.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                  {selectedVariant && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                      {selectedVariant.color && <span className="rounded-full bg-pearl px-3 py-1 text-ink/70">Selected color: {selectedVariant.color}</span>}
                      {selectedVariant.size && <span className="rounded-full bg-pearl px-3 py-1 text-ink/70">Selected size: {selectedVariant.size}</span>}
                      <span className="rounded-full bg-champagne px-3 py-1 text-bronze">Selected price: {formatPrice(activePrice)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Color", selectedVariant?.color],
                  ["Size", selectedVariant?.size],
                  ["Stock", selectedVariant ? selectedVariant.stock : selectedProduct.stock ?? "Available"],
                ]
                  .filter(([, value]) => value !== undefined && value !== null && value !== "")
                  .map(([label, value]) => (
                    <div key={label} className="rounded-md border border-ink/10 bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/40">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
                    </div>
                  ))}
              </div>

              <div className="mt-6 hidden lg:sticky lg:bottom-0 lg:z-10 lg:block lg:bg-pearl lg:py-3">
                <PurchaseActions
                  quantity={quantity}
                  onDecrease={decreaseQuantity}
                  onIncrease={increaseQuantity}
                  onAddToCart={handleAddToCart}
                  cartMessage={cartMessage}
                />
              </div>

              {description && (
                <div className="mt-6 rounded-md border border-ink/10 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/40">Description</p>
                  <p
                    className="mt-2 text-sm leading-6 text-ink/65"
                    style={
                      isDescriptionExpanded
                        ? undefined
                        : {
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }
                    }
                  >
                    {description}
                  </p>
                  {canToggleDescription && (
                    <button
                      type="button"
                      onClick={() => setIsDescriptionExpanded((value) => !value)}
                      className="mt-2 text-sm font-semibold text-bronze transition hover:text-rosewood"
                    >
                      {isDescriptionExpanded ? "View less" : "View more"}
                    </button>
                  )}
                </div>
              )}

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-md bg-champagne px-4 py-3 text-sm font-semibold text-ink/70">
                  <Truck size={20} className="text-bronze" />
                  Free shipping on every order
                </div>
                <div className="flex items-center gap-3 rounded-md bg-champagne px-4 py-3 text-sm font-semibold text-ink/70">
                  <ShieldCheck size={20} className="text-bronze" />
                  Quality checked before dispatch
                </div>
              </div>

              {selectedProduct.video && (
                <div className="mt-8 rounded-md border border-ink/10 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
                    <PlayCircle size={18} className="text-bronze" />
                    Product Video
                  </div>
                  <video src={selectedProduct.video} controls className="max-h-96 w-full rounded-md bg-ink" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-pearl/95 px-4 py-3 shadow-[0_-12px_35px_rgba(23,20,18,0.12)] backdrop-blur sm:px-6 lg:hidden">
        <div className="mx-auto max-w-7xl">
          <PurchaseActions
            quantity={quantity}
            onDecrease={decreaseQuantity}
            onIncrease={increaseQuantity}
            onAddToCart={handleAddToCart}
            cartMessage={cartMessage}
            compact
          />
        </div>
      </div>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-ink/10 pb-5">
              <div>
                <h2 className="font-display text-3xl font-bold text-ink">Customer Reviews</h2>
                <p className="mt-2 text-sm text-ink/55">
                  {hasReviews
                    ? `${totalReviews} reviews with an average rating of ${averageRating}.`
                    : "Customers can review after their order is delivered."}
                </p>
              </div>
              <Button as={Link} to={isAuthenticated ? "/orders" : "/login"} variant="secondary" className="hidden sm:inline-flex">
                {isAuthenticated ? "Review From Orders" : "Login to Review"}
              </Button>
            </div>

            {(reviewError || reviewMessage) && (
              <div className={`mb-5 rounded-md px-4 py-3 text-sm ${reviewError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                {reviewError || reviewMessage}
              </div>
            )}

            {reviewsLoading ? (
              <div className="flex min-h-40 items-center justify-center">
                <Loader />
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <article key={review._id} className="rounded-md border border-ink/10 bg-pearl p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{review.name}</p>
                        <p className="text-xs text-ink/45">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-bold text-bronze">
                        <Star size={15} fill="currentColor" />
                        {review.rating}
                      </span>
                    </div>
                    {review.title && <h3 className="mt-4 text-base font-bold text-ink">{review.title}</h3>}
                    <p className="mt-2 text-sm leading-6 text-ink/65">{review.comment}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-ink/10 bg-pearl p-8 text-center text-sm text-ink/55">
                No customer reviews yet.
              </div>
            )}
        </div>
      </section>

      {isImageViewerOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-ink/90 p-4" onClick={() => setIsImageViewerOpen(false)}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="truncate text-sm font-semibold text-white">{selectedProduct.name}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setImageZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))));
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink"
                aria-label="Zoom out"
              >
                <ZoomOut size={18} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setImageZoom(1);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink"
                aria-label="Reset zoom"
              >
                <RotateCcw size={18} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setImageZoom((value) => Math.min(3, Number((value + 0.25).toFixed(2))));
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink"
                aria-label="Zoom in"
              >
                <ZoomIn size={18} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsImageViewerOpen(false);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink"
                aria-label="Close image viewer"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-md bg-black/20" onClick={(event) => event.stopPropagation()}>
            <img
              src={selectedImage || images[0]}
              alt={selectedProduct.name}
              className="max-h-full max-w-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${imageZoom})` }}
            />
          </div>
        </div>
      )}

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-bronze">Recommended</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink">You May Also Like</h2>
            </div>
            <Link to="/" className="rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink">
              View Store
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {relatedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
            {relatedProducts.length === 0 && (
              <div className="col-span-full rounded-md border border-ink/10 bg-white p-8 text-center text-sm text-ink/55">
                Related products will appear as your catalogue grows.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default ProductDetails;
