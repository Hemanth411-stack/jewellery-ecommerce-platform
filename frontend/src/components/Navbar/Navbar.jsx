import { ChevronDown, Heart, LogOut, Menu, PackageCheck, Search, ShoppingCart, Sparkles, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../../features/auth/authSlice.js";
import { clearCartState, fetchCart } from "../../features/cart/cartSlice.js";
import { fetchProducts } from "../../features/products/productSlice.js";
import { clearWishlist } from "../../features/wishlist/wishlistSlice.js";
import { searchProducts } from "../../utils/productSearch.js";

const categoryLinks = [
  { label: "Rings", path: "/?category=Rings#shop-products" },
  { label: "Earrings", path: "/?category=Earrings#shop-products" },
  { label: "Necklaces", path: "/?category=Necklaces#shop-products" },
  { label: "Bracelets", path: "/?category=Bracelets#shop-products" },
  { label: "Bangles", path: "/?category=Bangles#shop-products" },
  { label: "Pendants", path: "/?category=Pendants#shop-products" },
  { label: "Anklets", path: "/?category=Anklets#shop-products" },
];

const pageLinks = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/#shop-products" },
  { label: "Contact", path: "/#footer" },
];

function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeResult, setActiveResult] = useState(-1);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartCount = useSelector((state) => state.cart.items.reduce((count, item) => count + item.quantity, 0));
  const { products, isLoading: productsLoading } = useSelector((state) => state.products);
  const matches = searchTerm.trim()
    ? searchProducts(products.filter((product) => product.isActive), searchTerm)
    : [];
  const suggestions = matches.slice(0, 5);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    setSearchTerm(new URLSearchParams(location.search).get("q") || "");
    setSearchOpen(false);
    setActiveResult(-1);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!searchRef.current?.contains(event.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const showSearch = () => {
    setSearchOpen(true);
    if (!products.length && !productsLoading) dispatch(fetchProducts());
  };

  const goToResults = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/?q=${encodeURIComponent(query)}#shop-products` : "/#shop-products");
    setSearchOpen(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(clearWishlist());
    dispatch(clearCartState());
    setIsOpen(false);
  };

  const isActivePath = (path) => {
    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    return path === "/" ? location.pathname === "/" && !location.search && !location.hash : currentPath === path;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-white/95 shadow-sm backdrop-blur">
      <div className="bg-rosewood px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white">
        Flat 30% off on selected styles | Free shipping on every order
      </div>
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-champagne text-bronze shadow-sm transition group-hover:bg-rosewood group-hover:text-white">
            <Sparkles size={20} />
          </span>
          <span>
            <span className="block font-display text-2xl font-bold leading-none text-ink">Himapriya</span>
            <span className="mt-1 hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/45 sm:block">Fine Jewellery</span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 rounded-full border border-ink/10 bg-pearl px-2 py-1 lg:flex">
          {pageLinks.slice(0, 2).map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActivePath(link.path) ? "bg-white text-bronze shadow-sm" : "text-ink/70 hover:bg-white hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="group relative">
            <button type="button" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-ink/70 transition hover:bg-white hover:text-ink">
              Category
              <ChevronDown size={16} className="transition group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-1/2 top-full z-50 mt-3 min-w-64 -translate-x-1/2 translate-y-2 rounded-md border border-ink/10 bg-white p-2 opacity-0 shadow-soft transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-bronze">Shop by category</p>
              {categoryLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold text-ink/70 transition hover:bg-champagne hover:text-ink"
                >
                  <span>{link.label}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-bronze/50" />
                </Link>
              ))}
            </div>
          </div>
          {pageLinks.slice(2).map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActivePath(link.path) ? "bg-white text-bronze shadow-sm" : "text-ink/70 hover:bg-white hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/cart" className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-bronze hover:bg-champagne">
            <ShoppingCart size={17} />
            Cart
            {cartCount > 0 && <span className="rounded-full bg-rosewood px-2 py-0.5 text-xs font-bold text-white" aria-label={`${cartCount} items in cart`}>{cartCount}</span>}
          </Link>
          {isAuthenticated ? (
            <>
              {user?.role === "admin" && (
                <Link to="/admin/products" className="rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-bronze">
                  Admin
                </Link>
              )}
              <Link to="/orders" className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-bronze hover:bg-champagne">
                <PackageCheck size={17} />
                Orders
              </Link>
              <Link to="/wishlist" className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-bronze hover:bg-champagne">
                <Heart size={17} />
                Wishlist
              </Link>
              <Link to="/profile" className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-rosewood">
                <User size={17} />
                Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-champagne"
              >
                <LogOut size={17} />
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-rosewood">
              Login
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link to="/cart" className="relative rounded-md p-2 text-ink" aria-label={`Cart, ${cartCount} items`}>
            <ShoppingCart size={23} />
            {cartCount > 0 && <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rosewood px-1 text-[10px] font-bold text-white">{cartCount}</span>}
          </Link>
          <button
            className="rounded-md p-2 text-ink lg:hidden"
            onClick={() => setIsOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {location.pathname !== "/login" && location.pathname !== "/signup" && <div ref={searchRef} className="relative mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:px-8">
        <form onSubmit={goToResults} role="search" className="relative">
          <Search size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/45" />
          <input
            type="search"
            value={searchTerm}
            onFocus={showSearch}
            onChange={(event) => { setSearchTerm(event.target.value); setActiveResult(-1); setSearchOpen(true); }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setSearchOpen(false);
              if (event.key === "ArrowDown" && suggestions.length) {
                event.preventDefault();
                setActiveResult((index) => (index + 1) % suggestions.length);
              }
              if (event.key === "ArrowUp" && suggestions.length) {
                event.preventDefault();
                setActiveResult((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
              }
              if (event.key === "Enter" && activeResult >= 0 && suggestions[activeResult]) {
                event.preventDefault();
                navigate(`/products/${suggestions[activeResult]._id}`);
                setSearchOpen(false);
              }
            }}
            aria-label="Search products"
            aria-expanded={searchOpen && Boolean(searchTerm.trim())}
            placeholder="Search jewellery by name, category, colour, size or SKU"
            className="w-full rounded-md border border-ink/15 bg-pearl py-3 pl-11 pr-24 text-sm text-ink outline-none focus:border-bronze focus:ring-4 focus:ring-bronze/10"
          />
          <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md bg-ink px-4 py-2 text-xs font-semibold text-white hover:bg-rosewood">Search</button>
        </form>
        {searchOpen && searchTerm.trim() && (
          <div className="absolute left-4 right-4 top-full z-50 max-h-[70vh] overflow-y-auto rounded-md border border-ink/10 bg-white p-2 shadow-soft sm:left-6 sm:right-6 lg:left-8 lg:right-8">
            {productsLoading ? <p className="px-3 py-3 text-sm text-ink/55">Searching products…</p> : suggestions.length ? (
              <>
                {suggestions.map((product, index) => (
                  <Link
                    key={product._id}
                    to={`/products/${product._id}`}
                    onClick={() => setSearchOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${index === activeResult ? "bg-champagne" : "hover:bg-pearl"}`}
                  >
                    <span className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-champagne">{product.images?.[0] && <img src={product.images[0]} alt="" className="h-full w-full object-cover" />}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-ink">{product.name}</span><span className="block truncate text-xs text-ink/50">{product.category}{product.sku ? ` · ${product.sku}` : ""}</span></span>
                    <span className="text-xs font-bold text-bronze">₹{Number(product.variants?.length ? Math.min(...product.variants.map((option) => option.price)) : product.price).toLocaleString("en-IN")}</span>
                  </Link>
                ))}
                <button type="button" onClick={goToResults} className="mt-1 w-full rounded-md border-t border-ink/10 px-3 py-3 text-left text-sm font-semibold text-bronze hover:bg-pearl">View all {matches.length} results</button>
              </>
            ) : <p className="px-3 py-3 text-sm text-ink/55">No matching products. Try another name, category or option.</p>}
          </div>
        )}
      </div>}

      {isOpen && (
        <div className="border-t border-ink/10 bg-pearl px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {pageLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-ink/75 hover:bg-champagne hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-bronze">Category</p>
            {categoryLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-ink/75 hover:bg-champagne hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 grid gap-3 border-t border-ink/10 pt-4">
              {isAuthenticated && (
                <>
                  {user?.role === "admin" && (
                    <Link to="/admin/products" onClick={() => setIsOpen(false)} className="rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">
                      Admin
                    </Link>
                  )}
                  <Link to="/orders" onClick={() => setIsOpen(false)} className="rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">
                    Orders
                  </Link>
                  <Link to="/wishlist" onClick={() => setIsOpen(false)} className="rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">
                    Wishlist
                  </Link>
                  <Link to="/cart" onClick={() => setIsOpen(false)} className="rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">
                    Cart {cartCount > 0 && `(${cartCount})`}
                  </Link>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-md border border-ink/10 px-4 py-2 text-left text-sm font-semibold text-ink"
                  >
                    Logout
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <Link to="/cart" onClick={() => setIsOpen(false)} className="rounded-md border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">
                    Cart {cartCount > 0 && `(${cartCount})`}
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="rounded-md bg-ink px-4 py-2 text-center text-sm font-semibold text-white"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
