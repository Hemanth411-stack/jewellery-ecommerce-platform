import {
  ArrowRight,
  Gift,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import Button from "../../components/common/Button.jsx";
import HeroRingModel from "../../components/HeroRingModel/HeroRingModel.jsx";
import ProductCard from "../../components/ProductCard/ProductCard.jsx";
import SectionTitle from "../../components/SectionTitle/SectionTitle.jsx";
import { fetchProducts } from "../../features/products/productSlice.js";
import { fetchWishlist } from "../../features/wishlist/wishlistSlice.js";

const categories = [
  {
    name: "Rings",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Necklaces",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Earrings",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Bracelets",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80",
  },
];

const fallbackProducts = [
  {
    name: "Diamond Ring",
    material: "18K gold with brilliant diamonds",
    price: "INR 42,999",
    category: "Rings",
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Gold Necklace",
    material: "Handcrafted 22K gold finish",
    price: "INR 86,499",
    category: "Necklaces",
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Pearl Earrings",
    material: "Freshwater pearls and gold accents",
    price: "INR 14,999",
    category: "Earrings",
    isFeatured: false,
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Gold Bracelet",
    material: "Minimal chain bracelet",
    price: "INR 28,499",
    category: "Bracelets",
    isFeatured: false,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80",
  },
];

const sortProducts = (items, sortBy) => {
  const sortedProducts = [...items];

  if (sortBy === "price-low") {
    return sortedProducts.sort((first, second) => Number(first.price || 0) - Number(second.price || 0));
  }

  if (sortBy === "price-high") {
    return sortedProducts.sort((first, second) => Number(second.price || 0) - Number(first.price || 0));
  }

  if (sortBy === "newest") {
    return sortedProducts.sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0));
  }

  return sortedProducts.sort((first, second) => Number(second.isFeatured) - Number(first.isFeatured));
};

const getProductsByCategory = (items, categoryName) =>
  items.filter((product) => product.category === categoryName).slice(0, 4);

const PRODUCTS_PER_PAGE = 8;

function Home() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { products: apiProducts, isLoading, error } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [visibleProductCount, setVisibleProductCount] = useState(PRODUCTS_PER_PAGE);
  const sourceProducts = apiProducts.length > 0 ? apiProducts : fallbackProducts;

  const categoryOptions = useMemo(() => {
    const productCategories = sourceProducts.map((product) => product.category).filter(Boolean);
    return ["All", ...new Set([...categories.map((category) => category.name), ...productCategories])];
  }, [sourceProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredItems = sourceProducts.filter((product) => {
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesFeatured = !showFeaturedOnly || product.isFeatured;
      const searchableText = [
        product.name,
        product.category,
        product.collection,
        product.metal,
        product.gemstone,
        product.shortDescription,
        product.material,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCategory && matchesFeatured && searchableText.includes(normalizedSearch);
    });

    return sortProducts(filteredItems, sortBy);
  }, [searchTerm, selectedCategory, showFeaturedOnly, sortBy, sourceProducts]);

  const mostGiftedProducts = sortProducts(sourceProducts, "featured").slice(0, 4);
  const visibleProducts = filteredProducts.slice(0, visibleProductCount);
  const hasMoreProducts = visibleProductCount < filteredProducts.length;

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    setVisibleProductCount(PRODUCTS_PER_PAGE);
  }, [searchTerm, selectedCategory, showFeaturedOnly, sortBy]);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const nextCategory = categoryParam
      ? categoryOptions.find((categoryName) => categoryName.toLowerCase() === categoryParam.toLowerCase()) || "All"
      : "All";

    setSelectedCategory(nextCategory);

    if (location.hash) {
      const section = document.getElementById(location.hash.slice(1));
      window.setTimeout(() => section?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    }
  }, [categoryOptions, location.hash, searchParams]);

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    document.getElementById("shop-products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <section className="bg-champagne">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:px-8 lg:py-20">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-bronze">Fine jewellery</p>
            <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
              Timeless Jewellery, Crafted for Every Moment
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-ink/65">
              Discover refined rings, necklaces, earrings, and bracelets designed with a premium finish for modern Indian celebrations.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as="a" href="#shop-products" className="px-6">
                Shop Now <ArrowRight size={18} />
              </Button>
              <Link to="/signup" className="inline-flex min-h-11 items-center rounded-md border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink">
                Create Account
              </Link>
            </div>
          </div>
          <div>
            <HeroRingModel />
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 text-sm font-semibold text-ink/70 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3">
            <Truck size={20} className="text-bronze" />
            Free shipping
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-bronze" />
            Quality checked jewellery
          </div>
          <div className="flex items-center gap-3">
            <RotateCcw size={20} className="text-bronze" />
            Easy returns support
          </div>
          <div className="flex items-center gap-3">
            <Gift size={20} className="text-bronze" />
            Gift-ready packaging
          </div>
        </div>
      </section>

      <section id="about" className="px-4 py-20 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Categories"
          title="Explore by Style"
          description="Choose a category to jump into the live catalogue."
        />
        <div className="mx-auto mb-10 flex max-w-7xl gap-4 overflow-x-auto pb-2">
          {categoryOptions.filter((categoryName) => categoryName !== "All").map((categoryName) => {
            const matchingProduct = sourceProducts.find((product) => product.category === categoryName);
            const image = matchingProduct?.images?.[0] || categories.find((category) => category.name === categoryName)?.image;

            return (
              <button
                type="button"
                key={categoryName}
                onClick={() => handleCategoryClick(categoryName)}
                className="min-w-24 text-center"
              >
                <span className="mx-auto block h-20 w-20 overflow-hidden rounded-full border border-ink/10 bg-champagne shadow-sm">
                  {image && <img src={image} alt={categoryName} className="h-full w-full object-cover" />}
                </span>
                <span className="mt-2 block text-sm font-semibold text-ink/70">{categoryName}</span>
              </button>
            );
          })}
        </div>
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <button
              type="button"
              key={category.name}
              onClick={() => handleCategoryClick(category.name)}
              className="group relative aspect-[4/5] overflow-hidden rounded-md bg-ink text-left"
            >
              <img src={category.image} alt={category.name} className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <h3 className="absolute bottom-5 left-5 font-display text-2xl font-bold text-white">{category.name}</h3>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-pearl px-4 py-20 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Most Gifted"
          title="Customer Favourite Picks"
          description="A quick rail for your most giftable and featured pieces."
        />
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mostGiftedProducts.map((product) => (
            <ProductCard key={product._id || product.name} product={product} />
          ))}
        </div>
      </section>

      <section id="shop-products" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Shop"
          title="Explore the Collection"
          description="Search, filter, sort, and save your favourite jewellery pieces from the live product catalogue."
        />

        <div className="mx-auto mb-8 max-w-7xl rounded-md border border-ink/10 bg-pearl p-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
            <label className="relative block">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-md border border-ink/10 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-bronze"
                placeholder="Search by product, metal, gemstone, or collection"
              />
            </label>
            <label className="flex items-center gap-2 rounded-md border border-ink/10 bg-white px-4 py-3 text-sm font-medium text-ink">
              <Sparkles size={17} className="text-bronze" />
              <input
                type="checkbox"
                checked={showFeaturedOnly}
                onChange={(event) => setShowFeaturedOnly(event.target.checked)}
                className="h-4 w-4 accent-bronze"
              />
              Featured only
            </label>
            <label className="relative block">
              <SlidersHorizontal size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="w-full min-w-48 rounded-md border border-ink/10 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-bronze"
              >
                <option value="featured">Featured first</option>
                <option value="newest">Newest first</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {categoryOptions.map((categoryName) => (
              <button
                key={categoryName}
                type="button"
                onClick={() => setSelectedCategory(categoryName)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  selectedCategory === categoryName
                    ? "border-ink bg-ink text-white"
                    : "border-ink/10 bg-white text-ink/65 hover:border-bronze hover:text-ink"
                }`}
              >
                {categoryName}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading && apiProducts.length === 0 && (
            <div className="col-span-full rounded-md border border-ink/10 bg-pearl p-8 text-center text-sm text-ink/55">
              Loading products...
            </div>
          )}
          {error && apiProducts.length === 0 && (
            <div className="col-span-full rounded-md border border-red-100 bg-red-50 p-8 text-center text-sm text-red-700">
              {error}
            </div>
          )}
          {!isLoading &&
            visibleProducts.map((product) => (
              <ProductCard key={product._id || product.name} product={product} />
            ))}
          {!isLoading && filteredProducts.length === 0 && (
            <div className="col-span-full rounded-md border border-ink/10 bg-pearl p-10 text-center">
              <h3 className="font-display text-2xl font-bold text-ink">No products match this view</h3>
              <p className="mt-2 text-sm text-ink/55">Try a different category, search term, or sorting option.</p>
            </div>
          )}
        </div>
        {!isLoading && hasMoreProducts && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setVisibleProductCount((count) => count + PRODUCTS_PER_PAGE)}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-ink/10 bg-pearl px-6 py-2.5 text-sm font-semibold text-ink transition hover:border-bronze hover:bg-white"
            >
              Load More
            </button>
            <p className="mt-3 text-sm text-ink/50">
              Showing {visibleProducts.length} of {filteredProducts.length} products
            </p>
          </div>
        )}
      </section>

      {categoryOptions
        .filter((categoryName) => categoryName !== "All")
        .map((categoryName) => {
          const productsByCategory = getProductsByCategory(sourceProducts, categoryName);

          if (productsByCategory.length === 0) return null;

          return (
            <section key={categoryName} className="bg-pearl px-4 py-16 sm:px-6 lg:px-8">
              <div className="mx-auto mb-8 flex max-w-7xl items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-bronze">{categoryName}</p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-ink">Shop {categoryName}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => handleCategoryClick(categoryName)}
                  className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink"
                >
                  View All <ArrowRight size={16} />
                </button>
              </div>
              <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {productsByCategory.map((product) => (
                  <ProductCard key={product._id || product.name} product={product} />
                ))}
              </div>
            </section>
          );
        })}

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-8 rounded-md bg-rosewood px-6 py-10 text-white md:grid-cols-[1.4fr_0.6fr] md:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">Limited launch edit</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Wedding-ready classics with a modern finish.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">
              Save your favourites now and continue building your selection as new Himapriya pieces are added.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <Link to="/wishlist" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-ink">
              <Sparkles size={17} />
              View Wishlist
            </Link>
            <a href="#shop-products" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/25 px-5 py-2.5 text-sm font-semibold text-white">
              <ShoppingBag size={17} />
              Continue Shopping
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
