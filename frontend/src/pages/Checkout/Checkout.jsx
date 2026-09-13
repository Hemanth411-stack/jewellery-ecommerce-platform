import { ArrowLeft, ArrowRight, Check, CheckCircle2, CreditCard, LockKeyhole, MapPin, ShieldCheck, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import Loader from "../../components/common/Loader.jsx";
import { fetchCart } from "../../features/cart/cartSlice.js";
import { clearOrderStatus, confirmOnlineOrder } from "../../features/orders/orderSlice.js";
import orderService from "../../features/orders/orderService.js";

const emptyAddress = {
  fullName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);

const getItemPrice = (item) => item.variant?.price ?? item.product.price;
const getVariantLabel = (variant) => [variant?.color, variant?.size].filter(Boolean).join(" / ");

const loadRazorpay = () => new Promise((resolve, reject) => {
  if (window.Razorpay) return resolve();
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = resolve;
  script.onerror = () => reject(new Error("Could not load Razorpay checkout. Please try again."));
  document.body.appendChild(script);
});

function AddressFields({ prefix, values, onChange }) {
  const fieldName = (name) => `${prefix}.${name}`;
  const autoPrefix = prefix === "deliveryAddress" ? "shipping" : "billing";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2"><Input label="Full name *" name={fieldName("fullName")} value={values.fullName} onChange={onChange} autoComplete={`${autoPrefix} name`} required /></div>
      <Input label="Phone number *" name={fieldName("phone")} type="tel" inputMode="tel" value={values.phone} onChange={onChange} autoComplete={`${autoPrefix} tel`} required />
      <Input label="Email address" name={fieldName("email")} type="email" value={values.email} onChange={onChange} autoComplete={`${autoPrefix} email`} />
      <div className="sm:col-span-2"><Input label="Address line 1 *" name={fieldName("addressLine1")} value={values.addressLine1} onChange={onChange} autoComplete={`${autoPrefix} address-line1`} required /></div>
      <div className="sm:col-span-2"><Input label="Apartment, suite or landmark" name={fieldName("addressLine2")} value={values.addressLine2} onChange={onChange} autoComplete={`${autoPrefix} address-line2`} /></div>
      <Input label="City *" name={fieldName("city")} value={values.city} onChange={onChange} autoComplete={`${autoPrefix} address-level2`} required />
      <Input label="State *" name={fieldName("state")} value={values.state} onChange={onChange} autoComplete={`${autoPrefix} address-level1`} required />
      <Input label="PIN / postal code *" name={fieldName("postalCode")} inputMode="numeric" value={values.postalCode} onChange={onChange} autoComplete={`${autoPrefix} postal-code`} required />
      <Input label="Country *" name={fieldName("country")} value={values.country} onChange={onChange} autoComplete={`${autoPrefix} country-name`} required />
    </div>
  );
}

function Checkout() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items, isLoading } = useSelector((state) => state.cart);
  const { latestOrder, isPlacing, error, message } = useSelector((state) => state.orders);
  const [sameAsDelivery, setSameAsDelivery] = useState(true);
  const [formData, setFormData] = useState({
    deliveryAddress: {
      ...emptyAddress,
      fullName: user?.name || "",
      phone: user?.phone || "",
      email: user?.email || "",
    },
    billingAddress: {
      ...emptyAddress,
      fullName: user?.name || "",
      phone: user?.phone || "",
      email: user?.email || "",
    },
  });
  const [localError, setLocalError] = useState("");
  const [onlineBusy, setOnlineBusy] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(null);
  const [cartChecked, setCartChecked] = useState(false);

  const totals = useMemo(() => {
    const itemsTotal = items.reduce((total, item) => total + getItemPrice(item) * item.quantity, 0);
    return { itemsTotal };
  }, [items]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(clearOrderStatus());
      dispatch(fetchCart()).finally(() => setCartChecked(true));
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (latestOrder && cartChecked) {
    return (
      <section className="px-4 py-10 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-xl rounded-2xl border border-ink/10 bg-white px-6 py-10 text-center shadow-soft sm:px-12 sm:py-14">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-700"><CheckCircle2 size={36} /></span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-bronze">Payment confirmed</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Your order is placed</h1>
          <p className="mt-3 text-sm leading-6 text-ink/60">{message}</p>
          <p className="mt-6 rounded-xl bg-pearl px-4 py-4 text-sm font-semibold text-ink">Order total <span className="ml-2 text-lg text-bronze">{formatPrice(latestOrder.grandTotal)}</span></p>
          <Link to="/orders" className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-rosewood sm:w-auto">
            View my orders <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    );
  }

  if (cartChecked && !isLoading && items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    const [section, field] = name.split(".");

    setFormData((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  const requiredFields = ["fullName", "phone", "addressLine1", "city", "state", "postalCode", "country"];
  const validate = () => {
    const deliveryMissing = requiredFields.some((field) => !formData.deliveryAddress[field].trim());
    const billingAddress = sameAsDelivery ? formData.deliveryAddress : formData.billingAddress;
    const billingMissing = requiredFields.some((field) => !billingAddress[field].trim());

    if (deliveryMissing || billingMissing) {
      setLocalError("Please complete all required billing and delivery address fields.");
      return false;
    }

    setLocalError("");
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (onlineBusy || isPlacing) return;
    if (!validate()) return;

    const checkoutData = {
      deliveryAddress: formData.deliveryAddress,
      billingAddress: sameAsDelivery ? formData.deliveryAddress : formData.billingAddress,
    };

    setOnlineBusy(true);
    setLocalError("");
    try {
        await loadRazorpay();
        const { payment } = await orderService.startOnlineCheckout(checkoutData);
        const razorpay = new window.Razorpay({
          key: payment.keyId,
          amount: payment.amount,
          currency: payment.currency,
          order_id: payment.razorpayOrderId,
          name: "Himapriya",
          description: "Jewellery order",
          prefill: {
            name: checkoutData.billingAddress.fullName,
            email: checkoutData.billingAddress.email || user?.email || "",
            contact: checkoutData.billingAddress.phone,
          },
          theme: { color: "#A77B5B" },
          handler: async (paymentResponse) => {
            const verification = { orderId: payment.orderId, paymentResponse };
            setPendingVerification(verification);
            try {
              await dispatch(confirmOnlineOrder(verification)).unwrap();
              setPendingVerification(null);
              dispatch(fetchCart());
            } catch {
              // Keep the payment response so verification can be retried.
            } finally {
              setOnlineBusy(false);
            }
          },
          modal: {
            ondismiss: () => setOnlineBusy(false),
          },
        });
        razorpay.on("payment.failed", (failure) => {
          setLocalError(failure.error?.description || "Payment failed. Please try again.");
          setOnlineBusy(false);
        });
        razorpay.open();
    } catch (checkoutError) {
      setLocalError(checkoutError.response?.data?.message || checkoutError.message || "Could not start payment.");
      setOnlineBusy(false);
    }
  };

  const handleRetryVerification = async () => {
    if (!pendingVerification) return;
    try {
      await dispatch(confirmOnlineOrder(pendingVerification)).unwrap();
      setPendingVerification(null);
      dispatch(fetchCart());
    } catch {
      // Redux displays the verification error.
    }
  };

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <section className="min-h-[70vh] bg-pearl px-4 pb-14 pt-6 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/cart" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-ink/60 hover:text-bronze"><ArrowLeft size={17} /> Back to cart</Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-b border-ink/10 pb-6 sm:mt-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.23em] text-bronze">Secure checkout</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl lg:text-5xl">Complete your order</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-ink/55">Add your delivery details, review your items, then pay securely online.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-ink/65 shadow-sm"><LockKeyhole size={14} className="text-bronze" /> Secure payment</span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-ink/65 sm:max-w-xl sm:gap-3 sm:text-sm">
          <div className="rounded-lg border border-bronze/30 bg-champagne px-2 py-3"><span className="mr-1 text-bronze">01</span> Delivery</div>
          <div className="rounded-lg border border-ink/10 bg-white px-2 py-3"><span className="mr-1 text-bronze">02</span> Billing</div>
          <div className="rounded-lg border border-ink/10 bg-white px-2 py-3"><span className="mr-1 text-bronze">03</span> Payment</div>
        </div>

        <form className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] lg:items-start lg:gap-8" onSubmit={handleSubmit}>
          <div className="min-w-0 space-y-5">
            {(localError || error) && <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{localError || error}</div>}

            <section className="rounded-2xl border border-ink/10 bg-white p-4 shadow-soft sm:p-7">
              <div className="mb-6 flex items-start gap-3 border-b border-ink/10 pb-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-champagne text-bronze"><MapPin size={20} /></span>
                <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-bronze">Step 01</p><h2 className="mt-1 font-display text-2xl font-bold text-ink">Delivery address</h2><p className="mt-1 text-sm text-ink/50">Where should we send your order?</p></div>
              </div>
              <AddressFields prefix="deliveryAddress" values={formData.deliveryAddress} onChange={handleChange} />
            </section>

            <section className="rounded-2xl border border-ink/10 bg-white p-4 shadow-soft sm:p-7">
              <div className="mb-5 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-champagne text-bronze"><ShoppingBag size={20} /></span>
                <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-bronze">Step 02</p><h2 className="mt-1 font-display text-2xl font-bold text-ink">Billing address</h2></div>
              </div>
              <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-ink/10 bg-pearl px-4 py-3 text-sm font-semibold text-ink">
                <input type="checkbox" checked={sameAsDelivery} onChange={(event) => setSameAsDelivery(event.target.checked)} className="h-5 w-5 shrink-0 accent-bronze" />
                <span>Use my delivery address for billing</span>
                {sameAsDelivery && <Check size={17} className="ml-auto shrink-0 text-green-700" />}
              </label>
              {!sameAsDelivery && <div className="mt-6 border-t border-ink/10 pt-6"><AddressFields prefix="billingAddress" values={formData.billingAddress} onChange={handleChange} /></div>}
            </section>

            <section className="rounded-2xl border border-ink/10 bg-white p-4 shadow-soft sm:p-7">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-champagne text-bronze"><CreditCard size={20} /></span>
                <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-bronze">Step 03</p><h2 className="mt-1 font-display text-2xl font-bold text-ink">Online payment</h2><p className="mt-2 text-sm leading-6 text-ink/55">Razorpay will open after you review your order. Your order is confirmed once the payment is verified.</p></div>
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-pearl px-4 py-3 text-xs font-medium text-ink/60"><ShieldCheck size={18} className="shrink-0 text-bronze" /> Secure payment by card, UPI or another available Razorpay method.</div>
            </section>
          </div>

          <aside className="min-w-0 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft lg:sticky lg:top-44">
            <div className="flex items-center justify-between border-b border-ink/10 px-4 py-5 sm:px-6"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-bronze">Your bag</p><h2 className="mt-1 font-display text-2xl font-bold text-ink">Order summary</h2></div><span className="rounded-full bg-champagne px-3 py-1 text-xs font-bold text-ink/70">{itemCount} {itemCount === 1 ? "item" : "items"}</span></div>
            <div className="px-4 py-5 sm:px-6">
              {!cartChecked || isLoading ? <div className="flex min-h-32 items-center justify-center"><Loader /></div> : <>
                <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={`${item.product._id}-${item.variantId || ""}`} className="flex min-w-0 gap-3">
                      <Link to={`/products/${item.product._id}${item.variantId ? `?variant=${encodeURIComponent(item.variantId)}` : ""}`} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-champagne"><img src={item.product.images?.[0]} alt={item.product.name} className="h-full w-full object-cover" /></Link>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold text-ink">{item.product.name}</p>
                        {getVariantLabel(item.variant) && <p className="mt-1 truncate text-xs text-ink/50">{getVariantLabel(item.variant)}</p>}
                        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs">
                          <span className="text-ink/50">Qty {item.quantity}</span>
                          <span className="font-bold text-bronze">{formatPrice(getItemPrice(item) * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between gap-4 border-t border-ink/10 pt-5"><span className="text-sm font-bold text-ink">Item total</span><span className="text-xl font-bold text-bronze">{formatPrice(totals.itemsTotal)}</span></div>
                <p className="mt-2 text-xs text-ink/50">Only the item cost is charged.</p>
                {(localError || error) && <div role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{localError || error}</div>}
                {pendingVerification && (
                  <button
                    type="button"
                    disabled={isPlacing || onlineBusy}
                    onClick={handleRetryVerification}
                    className="mt-5 min-h-12 w-full rounded-md border border-bronze px-4 py-3 text-sm font-semibold text-bronze disabled:opacity-50"
                  >
                    Retry payment verification
                  </button>
                )}
                <Button type="submit" isLoading={isPlacing || onlineBusy} disabled={Boolean(pendingVerification)} className="mt-6 w-full py-3.5">
                  Proceed to payment <ArrowRight size={17} />
                </Button>
                <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-ink/50"><LockKeyhole size={14} className="shrink-0" /> Your payment is securely processed by Razorpay</div>
              </>}
            </div>
          </aside>
        </form>
      </div>
    </section>
  );
}

export default Checkout;
