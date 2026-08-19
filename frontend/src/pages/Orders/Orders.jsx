import { PackageCheck, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";
import { fetchMyOrders } from "../../features/orders/orderSlice.js";
import { clearReviewStatus, submitReview } from "../../features/reviews/reviewSlice.js";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const emptyReview = {
  rating: 5,
  title: "",
  comment: "",
};

function Orders() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { orders, isLoading, error } = useSelector((state) => state.orders);
  const { isSaving, error: reviewError, message: reviewMessage } = useSelector((state) => state.reviews);
  const [activeProductId, setActiveProductId] = useState("");
  const [reviewForms, setReviewForms] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyOrders());
      dispatch(clearReviewStatus());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const getReviewForm = (productId) => reviewForms[productId] || emptyReview;

  const handleReviewChange = (productId, field, value) => {
    setReviewForms((current) => ({
      ...current,
      [productId]: {
        ...getReviewForm(productId),
        [field]: value,
      },
    }));
  };

  const handleReviewSubmit = async (event, productId) => {
    event.preventDefault();

    try {
      await dispatch(submitReview({ productId, reviewData: getReviewForm(productId) })).unwrap();
      setReviewForms((current) => ({
        ...current,
        [productId]: emptyReview,
      }));
      setActiveProductId("");
      dispatch(fetchMyOrders());
    } catch {
      // Redux state renders the API error.
    }
  };

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-ink/10 pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-bronze">Account</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-ink">My Orders</h1>
            <p className="mt-2 text-sm text-ink/55">Write a review after your order has been delivered.</p>
          </div>
          <Link to="/" className="inline-flex min-h-11 items-center justify-center rounded-md border border-ink/10 bg-white px-5 py-2.5 text-sm font-semibold text-ink">
            Continue Shopping
          </Link>
        </div>

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader />
          </div>
        ) : error ? (
          <div className="rounded-md border border-red-100 bg-red-50 p-8 text-center text-sm text-red-700">{error}</div>
        ) : orders.length === 0 ? (
          <div className="rounded-md border border-ink/10 bg-white p-10 text-center shadow-soft">
            <PackageCheck size={42} className="mx-auto text-bronze" />
            <h2 className="mt-4 font-display text-2xl font-bold text-ink">No orders yet</h2>
            <p className="mt-2 text-sm text-ink/55">Your purchased jewellery will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <article key={order._id} className="overflow-hidden rounded-md border border-ink/10 bg-white shadow-soft">
                <div className="flex flex-col gap-3 border-b border-ink/10 bg-pearl px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-bold text-ink">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="mt-1 text-xs text-ink/50">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-bronze">
                      {order.status}
                    </span>
                    <span className="text-sm font-bold text-ink">{formatPrice(order.grandTotal)}</span>
                  </div>
                </div>

                <div className="divide-y divide-ink/10">
                  {order.items.map((item) => {
                    const productId = item.product;
                    const isReviewOpen = activeProductId === productId;
                    const form = getReviewForm(productId);

                    return (
                      <div key={`${order._id}-${productId}`} className="grid gap-4 p-5 lg:grid-cols-[1fr_360px] lg:items-start">
                        <div className="flex gap-4">
                          <Link to={`/products/${productId}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-champagne">
                            {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                          </Link>
                          <div className="min-w-0">
                            <Link to={`/products/${productId}`} className="font-semibold text-ink hover:text-bronze">
                              {item.name}
                            </Link>
                            <p className="mt-1 text-xs text-ink/50">SKU {item.sku}</p>
                            <p className="mt-2 text-sm text-ink/60">
                              Qty {item.quantity} x {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-md border border-ink/10 bg-pearl p-4">
                          {item.hasReviewed ? (
                            <p className="text-sm font-semibold text-green-700">Review submitted</p>
                          ) : item.canReview ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setActiveProductId(isReviewOpen ? "" : productId)}
                                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-rosewood"
                              >
                                <Star size={16} />
                                {isReviewOpen ? "Close Review" : "Write Review"}
                              </button>

                              {isReviewOpen && (
                                <form className="mt-4 space-y-3" onSubmit={(event) => handleReviewSubmit(event, productId)}>
                                  {(reviewError || reviewMessage) && (
                                    <div className={`rounded-md px-3 py-2 text-sm ${reviewError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                                      {reviewError || reviewMessage}
                                    </div>
                                  )}
                                  <label className="block">
                                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Rating</span>
                                    <select
                                      value={form.rating}
                                      onChange={(event) => handleReviewChange(productId, "rating", event.target.value)}
                                      className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-bronze"
                                    >
                                      {[5, 4, 3, 2, 1].map((rating) => (
                                        <option key={rating} value={rating}>{rating} stars</option>
                                      ))}
                                    </select>
                                  </label>
                                  <label className="block">
                                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Title</span>
                                    <input
                                      value={form.title}
                                      onChange={(event) => handleReviewChange(productId, "title", event.target.value)}
                                      className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-bronze"
                                      placeholder="Beautiful finish"
                                    />
                                  </label>
                                  <label className="block">
                                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Review</span>
                                    <textarea
                                      value={form.comment}
                                      onChange={(event) => handleReviewChange(productId, "comment", event.target.value)}
                                      rows="4"
                                      className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-bronze"
                                      placeholder="Tell others about quality, fit, shine, and delivery experience."
                                    />
                                  </label>
                                  <Button type="submit" isLoading={isSaving} className="w-full">
                                    Submit Review
                                  </Button>
                                </form>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-ink/55">Review will be available after delivery.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Orders;
