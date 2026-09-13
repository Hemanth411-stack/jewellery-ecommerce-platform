import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";
import {
  fetchCart,
  removeFromCart,
  updateCartItem,
} from "../../features/cart/cartSlice.js";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);

const getItemPrice = (item) => item.variant?.price ?? item.product.price;
const getVariantLabel = (variant) => [variant?.color, variant?.size].filter(Boolean).join(" / ");

function Cart() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items, isLoading, error } = useSelector((state) => state.cart);
  const itemsTotal = items.reduce((total, item) => total + getItemPrice(item) * item.quantity, 0);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-ink/10 pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Shopping Bag</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-ink">Cart</h1>
          </div>
          <Link to="/" className="inline-flex min-h-11 items-center justify-center rounded-md border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink">
            Continue Shopping
          </Link>
        </div>

        {error && <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader />
          </div>
        ) : items.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map((item) => {
                const variantLabel = getVariantLabel(item.variant);
                const variantId = item.variantId || "";
                const productPath = `/products/${item.product._id}${variantId ? `?variant=${encodeURIComponent(variantId)}` : ""}`;

                return (
                <article key={`${item.product._id}-${variantId}`} className="grid gap-4 rounded-md border border-ink/10 bg-white p-4 shadow-soft sm:grid-cols-[112px_1fr_auto]">
                  <Link to={productPath} className="aspect-square overflow-hidden rounded-md bg-champagne" aria-label={`View ${item.product.name}`}>
                    <img src={item.product.images?.[0]} alt={item.product.name} className="h-full w-full object-cover" />
                  </Link>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bronze">{item.product.category}</p>
                    <h2 className="mt-2 text-lg font-bold text-ink"><Link to={productPath} className="hover:text-bronze">{item.product.name}</Link></h2>
                    {variantLabel && <p className="mt-1 text-sm text-ink/55">{variantLabel}</p>}
                    <p className="mt-3 font-bold text-bronze">{formatPrice(getItemPrice(item))}</p>
                    <Link to={productPath} className="mt-2 inline-block text-xs font-semibold text-bronze hover:underline">View product details</Link>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="inline-flex h-10 items-center rounded-md border border-ink/10 bg-pearl">
                      <button type="button" onClick={() => dispatch(updateCartItem({ productId: item.product._id, variantId, quantity: Math.max(1, item.quantity - 1) }))} className="px-3" aria-label="Decrease quantity">
                        <Minus size={15} />
                      </button>
                      <span className="min-w-9 text-center text-sm font-bold">{item.quantity}</span>
                      <button type="button" onClick={() => dispatch(updateCartItem({ productId: item.product._id, variantId, quantity: item.quantity + 1 }))} className="px-3" aria-label="Increase quantity">
                        <Plus size={15} />
                      </button>
                    </div>
                    <button type="button" onClick={() => dispatch(removeFromCart({ productId: item.product._id, variantId }))} className="inline-flex items-center gap-2 text-sm font-semibold text-red-600">
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </article>
                );
              })}
            </div>

            <aside className="h-fit rounded-md border border-ink/10 bg-white p-5 shadow-soft">
              <h2 className="font-display text-2xl font-bold text-ink">Order Summary</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-base"><span className="font-bold">Item total</span><span className="font-bold text-bronze">{formatPrice(itemsTotal)}</span></div>
              </div>
              <Button as={Link} to="/checkout" className="mt-6 w-full">
                Proceed to Checkout
              </Button>
            </aside>
          </div>
        ) : (
          <div className="rounded-md border border-ink/10 bg-white px-6 py-16 text-center shadow-soft">
            <ShoppingBag size={36} className="mx-auto text-bronze" />
            <h2 className="mt-4 font-display text-2xl font-bold text-ink">Your cart is empty</h2>
            <p className="mt-2 text-sm text-ink/55">Add jewellery pieces to continue checkout.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Cart;
