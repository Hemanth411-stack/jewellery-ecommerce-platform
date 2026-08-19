import { Heart } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard.jsx";
import Loader from "../../components/common/Loader.jsx";
import { fetchWishlist } from "../../features/wishlist/wishlistSlice.js";

function Wishlist() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { products, isLoading, error } = useSelector((state) => state.wishlist);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-ink/10 pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Saved Selection</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-ink">Wishlist</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">
              Keep your favourite pieces ready for later. Cart and checkout will connect in upcoming phases.
            </p>
          </div>
          <Link to="/" className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white">
            Continue Shopping
          </Link>
        </div>

        {error && <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader />
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-ink/10 bg-white px-6 py-16 text-center shadow-soft">
            <Heart size={34} className="mx-auto text-bronze" />
            <h2 className="mt-4 font-display text-2xl font-bold text-ink">No saved products yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/60">
              Add products to your wishlist from the storefront and they will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Wishlist;
