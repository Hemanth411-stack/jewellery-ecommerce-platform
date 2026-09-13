import { Edit2, LogOut, Mail, PackageCheck, Phone, Save, ShieldCheck, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import Input from "../../components/common/Input.jsx";
import { logoutUser, updateCurrentUser } from "../../features/auth/authSlice.js";
import { clearCartState } from "../../features/cart/cartSlice.js";
import { clearWishlist } from "../../features/wishlist/wishlistSlice.js";

function Profile() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, isLoading, error, message } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
  }, [user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(clearWishlist());
    dispatch(clearCartState());
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setLocalError("");
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setLocalError("Name, email, and phone are required.");
      return;
    }

    try {
      await dispatch(updateCurrentUser(formData)).unwrap();
      setLocalError("");
      setIsEditing(false);
    } catch {
      // Redux renders the API error.
    }
  };

  return (
    <section className="bg-pearl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-md bg-ink px-6 py-8 text-white shadow-soft sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">My Account</p>
          <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-champagne text-bronze">
                <User size={30} />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">{user?.name || "Customer"}</h1>
                <p className="mt-1 text-sm capitalize text-white/60">{user?.role || "customer"} account</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-champagne"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-bold text-ink">Profile Details</h2>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-champagne"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              )}
            </div>

            {(localError || error || message) && (
              <div className={`mt-5 rounded-md px-4 py-3 text-sm ${localError || error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                {localError || error || message}
              </div>
            )}

            {isEditing ? (
              <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                <Input label="Name" name="name" value={formData.name} onChange={handleChange} />
                <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rosewood disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={17} />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-champagne"
                  >
                    <X size={17} />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center gap-3 rounded-md bg-pearl px-4 py-3">
                  <User size={18} className="text-bronze" />
                  <span className="font-semibold text-ink">{user?.name || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-3 rounded-md bg-pearl px-4 py-3">
                  <Mail size={18} className="text-bronze" />
                  <span className="font-semibold text-ink">{user?.email || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-3 rounded-md bg-pearl px-4 py-3">
                  <Phone size={18} className="text-bronze" />
                  <span className="font-semibold text-ink">{user?.phone || "Not provided"}</span>
                </div>
              </div>
            )}

            <div className="mt-3 text-sm">
              <div className="flex items-center gap-3 rounded-md bg-pearl px-4 py-3">
                <ShieldCheck size={18} className="text-bronze" />
                <span className="font-semibold capitalize text-ink">{user?.role || "customer"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
            <h2 className="font-display text-2xl font-bold text-ink">Quick Actions</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link to="/orders" className="rounded-md border border-ink/10 bg-pearl p-4 transition hover:border-bronze hover:bg-white">
                <PackageCheck size={22} className="text-bronze" />
                <p className="mt-3 font-bold text-ink">My Orders</p>
                <p className="mt-1 text-sm text-ink/55">Track purchases and write reviews.</p>
              </Link>
              <Link to="/#shop-products" className="rounded-md border border-ink/10 bg-pearl p-4 transition hover:border-bronze hover:bg-white">
                <ShoppingBag size={22} className="text-bronze" />
                <p className="mt-3 font-bold text-ink">Continue Shopping</p>
                <p className="mt-1 text-sm text-ink/55">Browse the latest jewellery pieces.</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;
