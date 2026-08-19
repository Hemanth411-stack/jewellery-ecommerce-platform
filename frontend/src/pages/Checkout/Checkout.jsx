import { CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import Loader from "../../components/common/Loader.jsx";
import { clearCartState, fetchCart } from "../../features/cart/cartSlice.js";
import { clearOrderStatus, placeOrder } from "../../features/orders/orderSlice.js";

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

function AddressFields({ title, prefix, values, onChange }) {
  const fieldName = (name) => `${prefix}.${name}`;

  return (
    <div className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
      <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Input label="Full Name" name={fieldName("fullName")} value={values.fullName} onChange={onChange} />
        <Input label="Phone" name={fieldName("phone")} value={values.phone} onChange={onChange} />
        <Input label="Email" name={fieldName("email")} value={values.email} onChange={onChange} />
        <Input label="Postal Code" name={fieldName("postalCode")} value={values.postalCode} onChange={onChange} />
        <Input label="Address Line 1" name={fieldName("addressLine1")} value={values.addressLine1} onChange={onChange} className="sm:col-span-2" />
        <Input label="Address Line 2" name={fieldName("addressLine2")} value={values.addressLine2} onChange={onChange} className="sm:col-span-2" />
        <Input label="City" name={fieldName("city")} value={values.city} onChange={onChange} />
        <Input label="State" name={fieldName("state")} value={values.state} onChange={onChange} />
        <Input label="Country" name={fieldName("country")} value={values.country} onChange={onChange} />
      </div>
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
    paymentMethod: "COD",
  });
  const [localError, setLocalError] = useState("");

  const totals = useMemo(() => {
    const itemsTotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
    const shippingFee = itemsTotal >= 999 || itemsTotal === 0 ? 0 : 99;
    return { itemsTotal, shippingFee, grandTotal: itemsTotal + shippingFee };
  }, [items]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(clearOrderStatus());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (latestOrder) {
    return (
      <section className="px-4 py-20 text-center sm:px-6 lg:px-8">
        <CheckCircle2 size={48} className="mx-auto text-green-600" />
        <h1 className="mt-4 font-display text-4xl font-bold text-ink">Order placed</h1>
        <p className="mt-3 text-sm text-ink/60">{message}</p>
        <p className="mt-2 text-sm font-semibold text-bronze">Order total: {formatPrice(latestOrder.grandTotal)}</p>
        <Link to="/orders" className="mt-6 inline-flex rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white">
          View My Orders
        </Link>
      </section>
    );
  }

  if (!isLoading && items.length === 0) {
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

    if (!validate()) return;

    try {
      await dispatch(
        placeOrder({
          deliveryAddress: formData.deliveryAddress,
          billingAddress: sameAsDelivery ? formData.deliveryAddress : formData.billingAddress,
          paymentMethod: formData.paymentMethod,
        })
      ).unwrap();
      dispatch(clearCartState());
    } catch {
      // Redux renders the API error.
    }
  };

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <form className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_360px]" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Checkout</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-ink">Address Details</h1>
          </div>

          {(localError || error) && <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{localError || error}</div>}

          <AddressFields title="Delivery Address" prefix="deliveryAddress" values={formData.deliveryAddress} onChange={handleChange} />

          <label className="flex items-center gap-3 rounded-md border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink">
            <input type="checkbox" checked={sameAsDelivery} onChange={(event) => setSameAsDelivery(event.target.checked)} className="h-4 w-4 accent-bronze" />
            Billing address is same as delivery address
          </label>

          {!sameAsDelivery && (
            <AddressFields title="Billing Address" prefix="billingAddress" values={formData.billingAddress} onChange={handleChange} />
          )}

          <div className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
            <h2 className="font-display text-2xl font-bold text-ink">Payment Method</h2>
            <label className="mt-4 flex items-center gap-3 rounded-md border border-ink/10 px-4 py-3 text-sm font-semibold">
              <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === "COD"} onChange={(event) => setFormData((current) => ({ ...current, paymentMethod: event.target.value }))} className="h-4 w-4 accent-bronze" />
              Cash on Delivery
            </label>
          </div>
        </div>

        <aside className="h-fit rounded-md border border-ink/10 bg-white p-5 shadow-soft">
          <h2 className="font-display text-2xl font-bold text-ink">Order Summary</h2>
          {isLoading ? (
            <div className="flex min-h-32 items-center justify-center">
              <Loader />
            </div>
          ) : (
            <>
              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div key={item.product._id} className="flex gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-md bg-champagne">
                      <img src={item.product.images?.[0]} alt={item.product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink">{item.product.name}</p>
                      <p className="text-xs text-ink/50">Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-bronze">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-3 border-t border-ink/10 pt-4 text-sm">
                <div className="flex justify-between"><span className="text-ink/60">Items total</span><span className="font-semibold">{formatPrice(totals.itemsTotal)}</span></div>
                <div className="flex justify-between"><span className="text-ink/60">Shipping</span><span className="font-semibold">{totals.shippingFee === 0 ? "Free" : formatPrice(totals.shippingFee)}</span></div>
                <div className="flex justify-between border-t border-ink/10 pt-3 text-base"><span className="font-bold">Grand total</span><span className="font-bold text-bronze">{formatPrice(totals.grandTotal)}</span></div>
              </div>
              <Button type="submit" isLoading={isPlacing} className="mt-6 w-full">
                Place Order
              </Button>
            </>
          )}
        </aside>
      </form>
    </section>
  );
}

export default Checkout;
