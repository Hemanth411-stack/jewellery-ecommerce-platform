import { Heart, Minus, Plus, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState("");

  const images = useMemo(() => {
    const productImages = selectedProduct?.images?.length ? selectedProduct.images : [];
    return productImages.length > 0 ? productImages : [fallbackImage];
  }, [selectedProduct]);

  const isWishlisted = wishlistProducts.some((product) => product._id === selectedProduct?._id);
  const hasReviews = Number(totalReviews) > 0;
  const hasDiscount = Number(selectedProduct?.compareAtPrice) > Number(selectedProduct?.price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(selectedProduct.compareAtPrice) - Number(selectedProduct.price)) / Number(selectedProduct.compareAtPrice)) * 100)
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

    dispatch(addToCart({ productId: selectedProduct._id, quantity }));
    setCartMessage(`Added ${quantity} item${quantity > 1 ? "s" : ""} to cart.`);
    window.setTimeout(() => setCartMessage(""), 2500);
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
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 text-sm text-ink/55">
            <Link to="/" className="hover:text-bronze">Home</Link> / <span>{selectedProduct.category}</span> / <span className="text-ink">{selectedProduct.name}</span>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-4 md:grid-cols-[96px_1fr]">
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
              <div className="order-1 aspect-square overflow-hidden rounded-md bg-champagne shadow-soft md:order-2">
                <img src={selectedImage || images[0]} alt={selectedProduct.name} className="h-full w-full object-cover" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-champagne px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-bronze">
                  {selectedProduct.category}
                </span>
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
                <p className="text-3xl font-bold text-bronze">{formatPrice(selectedProduct.price)}</p>
                {hasDiscount && <p className="text-lg text-ink/35 line-through">{formatPrice(selectedProduct.compareAtPrice)}</p>}
              </div>

              <p className="mt-5 text-base leading-7 text-ink/65">{selectedProduct.description}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Metal", selectedProduct.metal],
                  ["Purity", selectedProduct.metalPurity],
                  ["Gemstone", selectedProduct.gemstone],
                  ["Weight", selectedProduct.weightInGrams ? `${selectedProduct.weightInGrams} g` : ""],
                  ["Size", selectedProduct.size],
                  ["Craft", selectedProduct.craftsmanship],
                ]
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div key={label} className="rounded-md border border-ink/10 bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/40">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
                    </div>
                  ))}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <div className="inline-flex h-12 items-center rounded-md border border-ink/10 bg-white">
                  <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="px-4" aria-label="Decrease quantity">
                    <Minus size={16} />
                  </button>
                  <span className="min-w-10 text-center text-sm font-bold">{quantity}</span>
                  <button type="button" onClick={() => setQuantity((value) => value + 1)} className="px-4" aria-label="Increase quantity">
                    <Plus size={16} />
                  </button>
                </div>
                <Button type="button" onClick={handleAddToCart} className="flex-1">
                  <ShoppingBag size={18} />
                  Add to Cart
                </Button>
                <button
                  type="button"
                  onClick={handleWishlistClick}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-ink/10 bg-white px-5 text-sm font-semibold text-ink"
                >
                  <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-rosewood" : ""} />
                  {isWishlisted ? "Saved" : "Wishlist"}
                </button>
              </div>
              {cartMessage && <p className="mt-3 text-sm font-semibold text-bronze">{cartMessage}</p>}

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-md bg-champagne px-4 py-3 text-sm font-semibold text-ink/70">
                  <Truck size={20} className="text-bronze" />
                  Free shipping on prepaid orders
                </div>
                <div className="flex items-center gap-3 rounded-md bg-champagne px-4 py-3 text-sm font-semibold text-ink/70">
                  <ShieldCheck size={20} className="text-bronze" />
                  Quality checked before dispatch
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
