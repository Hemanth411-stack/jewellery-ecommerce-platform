import { CalendarDays, CreditCard, Eye, Mail, MapPin, PackageCheck, Phone, ReceiptText, ShoppingBag, Truck, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../../components/common/Loader.jsx";
import {
  clearOrderStatus,
  fetchAdminOrders,
  updateAdminOrderStatus,
} from "../../features/orders/orderSlice.js";

const orderStatuses = ["placed", "confirmed", "packed", "shipped", "delivered", "cancelled"];

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

const getProductId = (product) => product?._id || product;

const statusStyles = {
  placed: "bg-blue-50 text-blue-700",
  confirmed: "bg-indigo-50 text-indigo-700",
  packed: "bg-amber-50 text-amber-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

function InfoTile({ icon: Icon, label, value, tone = "default" }) {
  return (
    <div className={`rounded-md border p-4 ${tone === "strong" ? "border-bronze/20 bg-champagne" : "border-ink/10 bg-pearl"}`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
        <Icon size={15} className="text-bronze" />
        {label}
      </div>
      <p className={`mt-3 font-bold ${tone === "strong" ? "text-bronze" : "text-ink"}`}>{value}</p>
    </div>
  );
}

function AddressBlock({ title, address }) {
  if (!address) return null;

  return (
    <div className="rounded-md border border-ink/10 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-bronze">
        <MapPin size={15} />
        {title}
      </div>
      <p className="mt-4 font-semibold text-ink">{address.fullName}</p>
      <p className="mt-2 text-sm leading-6 text-ink/60">
        {address.addressLine1}
        {address.addressLine2 ? `, ${address.addressLine2}` : ""}
        <br />
        {address.city}, {address.state} {address.postalCode}
        <br />
        {address.country}
      </p>
      <p className="mt-3 text-sm font-medium text-ink/65">{address.phone}</p>
      {address.email && <p className="text-sm text-ink/50">{address.email}</p>}
    </div>
  );
}

function DetailModal({ order, mode, onClose }) {
  if (!order) return null;

  const customerName = order.user?.name || order.deliveryAddress?.fullName || "Customer";
  const customerEmail = order.user?.email || order.deliveryAddress?.email || "No email";
  const customerPhone = order.user?.phone || order.deliveryAddress?.phone || "No phone";
  const isUserMode = mode === "user";
  const itemCount = order.items.reduce((total, item) => total + Number(item.quantity || 0), 0);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/70 px-4 py-6 backdrop-blur-sm" onClick={onClose}>
      <div className="relative flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-md border border-ink/10 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-ink/10 bg-ink px-5 py-5 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
              {isUserMode ? "Customer Details" : "Order Details"}
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold">
              {isUserMode ? customerName : `Order #${order._id.slice(-8).toUpperCase()}`}
            </h2>
            <p className="mt-2 text-sm text-white/60">
              {isUserMode ? customerEmail : `${itemCount} item${itemCount === 1 ? "" : "s"} placed on ${formatDate(order.createdAt)}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-sm transition hover:bg-white/20"
            aria-label="Close details"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {isUserMode ? (
          <div className="grid gap-5 overflow-y-auto bg-pearl p-5 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="rounded-md border border-ink/10 bg-white p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white">
                  <User size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bronze">Customer</p>
                  <h3 className="mt-1 truncate text-xl font-bold text-ink">{customerName}</h3>
                </div>
              </div>
              <div className="mt-6 grid gap-3 text-sm text-ink/65">
                <p className="flex items-center gap-3 rounded-md bg-pearl px-3 py-3">
                  <Mail size={17} className="text-bronze" />
                  <span className="min-w-0 truncate">{customerEmail}</span>
                </p>
                <p className="flex items-center gap-3 rounded-md bg-pearl px-3 py-3">
                  <Phone size={17} className="text-bronze" />
                  <span>{customerPhone}</span>
                </p>
                <p className="flex items-center gap-3 rounded-md bg-pearl px-3 py-3">
                  <PackageCheck size={17} className="text-bronze" />
                  <span className="capitalize">{order.status}</span>
                </p>
              </div>
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              <AddressBlock title="Delivery Address" address={order.deliveryAddress} />
              <AddressBlock title="Billing Address" address={order.billingAddress} />
              <div className="rounded-md border border-ink/10 bg-white p-4 xl:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bronze">Latest Order</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <InfoTile icon={ReceiptText} label="Order" value={`#${order._id.slice(-8).toUpperCase()}`} />
                  <InfoTile icon={CalendarDays} label="Placed" value={formatDate(order.createdAt)} />
                  <InfoTile icon={CreditCard} label="Paid By" value={order.paymentMethod} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 overflow-y-auto bg-pearl p-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 overflow-hidden rounded-md border border-ink/10 bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-4 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bronze">Order Items</p>
                  <h3 className="mt-1 text-lg font-bold text-ink">Products in this order</h3>
                </div>
                <span className="rounded-full bg-champagne px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-ink/70">
                  {itemCount} item{itemCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="hidden grid-cols-[minmax(0,1fr)_112px_72px_112px_112px] border-b border-ink/10 bg-champagne px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-ink/50 md:grid">
                <span>Product</span>
                <span>SKU</span>
                <span>Qty</span>
                <span>Price</span>
                <span className="text-right">Total</span>
              </div>
              <div className="divide-y divide-ink/10 bg-white">
                {order.items.map((item) => {
                  const productId = getProductId(item.product);

                  return (
                    <div key={`${order._id}-${productId}`} className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_112px_72px_112px_112px] md:items-center">
                      <div className="flex min-w-0 items-center gap-3">
                        <Link
                          to={`/products/${productId}`}
                          className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-champagne outline-none ring-bronze/40 transition hover:opacity-85 focus-visible:ring-4"
                          aria-label={`View ${item.name} details`}
                        >
                          {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                        </Link>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{item.name}</p>
                          <p className="mt-1 text-xs text-ink/45 md:hidden">SKU {item.sku}</p>
                        </div>
                      </div>
                      <p className="hidden text-sm text-ink/60 md:block">{item.sku}</p>
                      <p className="text-sm text-ink/60">Qty {item.quantity}</p>
                      <p className="text-sm text-ink/60">{formatPrice(item.price)}</p>
                      <p className="text-sm font-bold text-bronze md:text-right">{formatPrice(item.lineTotal)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="grid h-fit gap-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <InfoTile icon={User} label="Customer" value={customerName} />
                <InfoTile icon={CalendarDays} label="Placed" value={formatDate(order.createdAt)} />
                <InfoTile icon={Truck} label="Status" value={order.status} />
                <InfoTile icon={CreditCard} label="Payment" value={order.paymentMethod} />
              </div>
              <div className="rounded-md border border-ink/10 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bronze">Order Summary</p>
                <div className="mt-4 grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink/55">Items total</span>
                    <span className="font-semibold">{formatPrice(order.itemsTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/55">Shipping</span>
                    <span className="font-semibold">{order.shippingFee ? formatPrice(order.shippingFee) : "Free"}</span>
                  </div>
                  <div className="flex justify-between border-t border-ink/10 pt-3 text-base">
                    <span className="font-bold">Grand total</span>
                    <span className="font-bold text-bronze">{formatPrice(order.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        <div className="flex shrink-0 justify-end border-t border-ink/10 bg-pearl px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:bg-rosewood"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderManagement() {
  const dispatch = useDispatch();
  const { orders, isLoading, isUpdating, error, message } = useSelector((state) => state.orders);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailMode, setDetailMode] = useState("order");

  useEffect(() => {
    dispatch(fetchAdminOrders());

    return () => {
      dispatch(clearOrderStatus());
    };
  }, [dispatch]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const orderStats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => ["placed", "confirmed", "packed", "shipped"].includes(order.status)).length,
      delivered: orders.filter((order) => order.status === "delivered").length,
      revenue: orders
        .filter((order) => order.status !== "cancelled")
        .reduce((total, order) => total + Number(order.grandTotal || 0), 0),
    }),
    [orders]
  );

  const openDetails = (order, mode) => {
    setSelectedOrder(order);
    setDetailMode(mode);
  };

  const handleStatusChange = (orderId, status) => {
    dispatch(updateAdminOrderStatus({ orderId, status }));
  };

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink/55">Total Orders</p>
          <p className="mt-2 text-3xl font-bold text-ink">{orderStats.total}</p>
        </div>
        <div className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink/55">In Progress</p>
          <p className="mt-2 text-3xl font-bold text-ink">{orderStats.pending}</p>
        </div>
        <div className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink/55">Delivered</p>
          <p className="mt-2 text-3xl font-bold text-ink">{orderStats.delivered}</p>
        </div>
        <div className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
          <p className="text-sm text-ink/55">Revenue</p>
          <p className="mt-2 text-3xl font-bold text-ink">{formatPrice(orderStats.revenue)}</p>
        </div>
      </div>

      <div className="rounded-md border border-ink/10 bg-white shadow-soft">
        <div className="flex flex-col gap-4 border-b border-ink/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-bronze">Fulfilment</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink">Order Management</h2>
            <p className="mt-1 text-sm text-ink/55">Scan orders in rows, update status, and open details only when needed.</p>
          </div>
          <label className="block min-w-56">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">Filter</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-md border border-ink/10 bg-white px-4 py-3 text-sm font-semibold capitalize outline-none focus:border-bronze"
            >
              <option value="all">All orders</option>
              {orderStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>

        {(error || message) && (
          <div className={`mx-5 mt-5 rounded-md px-4 py-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {error || message}
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Loader />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag size={42} className="mx-auto text-bronze" />
            <h3 className="mt-4 font-display text-2xl font-bold text-ink">No orders found</h3>
            <p className="mt-2 text-sm text-ink/55">Orders will appear here after customers complete checkout.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-champagne text-xs uppercase tracking-[0.16em] text-ink/55">
                <tr>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Items</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {filteredOrders.map((order) => {
                  const customerName = order.user?.name || order.deliveryAddress?.fullName || "Customer";
                  const itemCount = order.items.reduce((total, item) => total + Number(item.quantity || 0), 0);

                  return (
                    <tr key={order._id} className="align-middle">
                      <td className="px-5 py-4">
                        <p className="font-bold text-ink">#{order._id.slice(-8).toUpperCase()}</p>
                        <p className="mt-1 text-xs text-ink/45">{order.paymentMethod}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-ink">{customerName}</p>
                        <p className="mt-1 max-w-44 truncate text-xs text-ink/50">{order.user?.email || order.deliveryAddress?.email || "No email"}</p>
                      </td>
                      <td className="px-5 py-4 text-ink/65">{formatDate(order.createdAt)}</td>
                      <td className="px-5 py-4 text-ink/65">{itemCount}</td>
                      <td className="px-5 py-4 font-bold text-bronze">{formatPrice(order.grandTotal)}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-2">
                          <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${statusStyles[order.status] || "bg-ink/5 text-ink/60"}`}>
                            {order.status}
                          </span>
                          <select
                            value={order.status}
                            disabled={isUpdating}
                            onChange={(event) => handleStatusChange(order._id, event.target.value)}
                            className="w-36 rounded-md border border-ink/10 bg-white px-3 py-2 text-xs font-semibold capitalize outline-none focus:border-bronze disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {orderStatuses.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openDetails(order, "order")}
                            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-ink/10 px-3 py-2 text-xs font-semibold text-ink transition hover:border-bronze"
                          >
                            <Eye size={15} />
                            View Order Details
                          </button>
                          <button
                            type="button"
                            onClick={() => openDetails(order, "user")}
                            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-rosewood"
                          >
                            <User size={15} />
                            User Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DetailModal order={selectedOrder} mode={detailMode} onClose={() => setSelectedOrder(null)} />
    </section>
  );
}

export default OrderManagement;
