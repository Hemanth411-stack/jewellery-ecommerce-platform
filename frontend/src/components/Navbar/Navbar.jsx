import { Heart, LogOut, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { logoutUser } from "../../features/auth/authSlice.js";
import { clearCartState, fetchCart } from "../../features/cart/cartSlice.js";
import { clearWishlist } from "../../features/wishlist/wishlistSlice.js";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Collections", path: "/#shop-products" },
  { label: "Rings", path: "/?category=Rings#shop-products" },
  { label: "Earrings", path: "/?category=Earrings#shop-products" },
  { label: "Necklaces", path: "/?category=Necklaces#shop-products" },
  { label: "About", path: "/#about" },
];

function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const wishlistCount = useSelector((state) => state.wishlist.products.length);
  const cartCount = useSelector((state) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0)
  );

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(clearWishlist());
    dispatch(clearCartState());
    setIsOpen(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const getLinkClassName = (path) => {
    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    const isActive = path === "/" ? location.pathname === "/" && !location.search && !location.hash : currentPath === path;

    return `text-sm font-medium transition hover:text-bronze ${isActive ? "text-bronze" : "text-ink/75"}`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-pearl/95 backdrop-blur">
      <div className="bg-rosewood px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white">
        Flat 30% off on selected styles | Free shipping on prepaid orders
      </div>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="font-display text-2xl font-bold text-ink">
          Himapriya
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className={getLinkClassName(link.path)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/#shop-products" className="rounded-full p-2 text-ink/75 transition hover:bg-champagne hover:text-ink" aria-label="Search">
            <Search size={20} />
          </Link>
          <Link to="/wishlist" className="relative rounded-full p-2 text-ink/75 transition hover:bg-champagne hover:text-ink" aria-label="Wishlist">
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rosewood px-1 text-[11px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative rounded-full p-2 text-ink/75 transition hover:bg-champagne hover:text-ink" aria-label="Cart">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rosewood px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <>
              {user?.role === "admin" && (
                <Link to="/admin/products" className="rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-champagne"
              >
                <LogOut size={17} />
                Logout
              </button>
              <Link to="/orders" className="inline-flex items-center gap-2 rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">
                <User size={17} />
                {user?.name?.split(" ")[0] || "Profile"}
              </Link>
            </>
          ) : (
            <Link to="/login" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-rosewood">
              Login
            </Link>
          )}
        </div>

        <button
          className="rounded-md p-2 text-ink lg:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-ink/10 bg-pearl px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-ink/75 hover:bg-champagne hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-3 border-t border-ink/10 pt-4">
              <Search size={20} />
              <Link to="/wishlist" onClick={() => setIsOpen(false)} className="relative">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rosewood px-1 text-[11px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link to="/cart" onClick={() => setIsOpen(false)} className="relative">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rosewood px-1 text-[11px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink"
                >
                  Logout
                </button>
              )}
              <Link
                to={isAuthenticated && user?.role === "admin" ? "/admin/products" : isAuthenticated ? "/orders" : "/login"}
                onClick={() => setIsOpen(false)}
                className="ml-auto rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white"
              >
                {isAuthenticated && user?.role === "admin" ? "Admin" : isAuthenticated ? "Profile" : "Login"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
