import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { productApi } from '../../../api/productApi';
import { extractApiError } from '../../../utils/formatters';
import ProductCard from '../../../components/ProductCard';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [material, setMaterial] = useState(searchParams.get('material') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('in_stock') === 'true');
  const [discountedOnly, setDiscountedOnly] = useState(searchParams.get('discounted') === 'true');
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '-created_at');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sync local state when URL query params change (e.g., clicking a link from Navbar/Home)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    setMaterial(searchParams.get('material') || '');
    setLocation(searchParams.get('location') || '');
    setMinPrice(searchParams.get('min_price') || '');
    setMaxPrice(searchParams.get('max_price') || '');
    setInStockOnly(searchParams.get('in_stock') === 'true');
    setDiscountedOnly(searchParams.get('discounted') === 'true');
    setOrdering(searchParams.get('ordering') || '-created_at');
    setPage(Number(searchParams.get('page') || 1));
  }, [searchParams]);

  useEffect(() => {
    productApi
      .getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');

    const params = { page, ordering };
    if (search.trim()) params.search = search.trim();
    if (category) params.category = category;
    if (material.trim()) params.material = material.trim();
    if (location.trim()) params.location = location.trim();
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (inStockOnly) params.in_stock = 'true';
    if (discountedOnly) params.discounted = 'true';
    if (searchParams.get('brand')) params.brand = searchParams.get('brand');

    productApi
      .getProducts(params)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setProducts(res.data);
          setCount(res.data.length);
          setNextPage(null);
          setPrevPage(null);
        } else {
          setProducts(res.data.results || []);
          setCount(res.data.count || 0);
          setNextPage(res.data.next);
          setPrevPage(res.data.previous);
        }
      })
      .catch((err) => {
        setError(extractApiError(err, 'Unable to load marketplace products.').message);
      })
      .finally(() => setLoading(false));
  }, [search, category, material, location, minPrice, maxPrice, inStockOnly, discountedOnly, ordering, page, searchParams]);

  const applyParams = (overrides = {}) => {
    const next = {
      search: overrides.search !== undefined ? overrides.search : search,
      category: overrides.category !== undefined ? overrides.category : category,
      material: overrides.material !== undefined ? overrides.material : material,
      location: overrides.location !== undefined ? overrides.location : location,
      min_price: overrides.min_price !== undefined ? overrides.min_price : minPrice,
      max_price: overrides.max_price !== undefined ? overrides.max_price : maxPrice,
      in_stock: overrides.in_stock !== undefined ? overrides.in_stock : inStockOnly,
      discounted: overrides.discounted !== undefined ? overrides.discounted : discountedOnly,
      ordering: overrides.ordering !== undefined ? overrides.ordering : ordering,
      page: overrides.page !== undefined ? overrides.page : 1,
    };

    const clean = {};
    if (next.search?.trim()) clean.search = next.search.trim();
    if (next.category) clean.category = next.category;
    if (next.material?.trim()) clean.material = next.material.trim();
    if (next.location?.trim()) clean.location = next.location.trim();
    if (next.min_price) clean.min_price = next.min_price;
    if (next.max_price) clean.max_price = next.max_price;
    if (next.in_stock) clean.in_stock = 'true';
    if (next.discounted) clean.discounted = 'true';
    if (next.ordering && next.ordering !== '-created_at') clean.ordering = next.ordering;
    if (next.page > 1) clean.page = String(next.page);
    setSearchParams(clean);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    search || category || material || location || minPrice || maxPrice || inStockOnly || discountedOnly || searchParams.get('brand')
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-ivory-border pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Varnika Storefront
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
            Shop Handcrafted Works
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Showing {count} authentic product{count === 1 ? '' : 's'}
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2.5">
          <label htmlFor="sort_select" className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Sort By:
          </label>
          <select
            id="sort_select"
            value={ordering}
            onChange={(e) => applyParams({ ordering: e.target.value, page: 1 })}
            className="input-field w-48 py-2 text-xs"
          >
            <option value="-created_at">Newest Arrivals</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-3">
          <div className="card-surface space-y-5 p-5">
            <div className="flex items-center justify-between border-b border-ivory-border pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink">
                <SlidersHorizontal className="h-3.5 w-3.5 text-terracotta" />
                Filter Catalog
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta hover:underline"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>

            {/* Keyword / Brand Search */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Product or Brand
              </label>
              <div className="relative mt-1.5">
                <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-ink-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => applyParams({ search: e.target.value, page: 1 })}
                  placeholder="Search..."
                  className="input-field py-2 pl-9 text-xs"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => applyParams({ category: e.target.value, page: 1 })}
                className="input-field mt-1.5 py-2 text-xs"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label} ({cat.product_count})
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Price Range (INR)
              </label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => applyParams({ min_price: e.target.value, page: 1 })}
                  placeholder="Min ₹"
                  className="input-field py-2 text-xs"
                />
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => applyParams({ max_price: e.target.value, page: 1 })}
                  placeholder="Max ₹"
                  className="input-field py-2 text-xs"
                />
              </div>
            </div>

            {/* Material */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Material
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => applyParams({ material: e.target.value, page: 1 })}
                placeholder="e.g., Brass, Clay, Cotton"
                className="input-field mt-1.5 py-2 text-xs"
              />
            </div>

            {/* Manufacturing Location */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Craft Region / City
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => applyParams({ location: e.target.value, page: 1 })}
                placeholder="e.g., Jaipur, Kutch, Varanasi"
                className="input-field mt-1.5 py-2 text-xs"
              />
            </div>

            {/* Availability & Offers Checkboxes */}
            <div className="space-y-2.5 border-t border-ivory-border pt-3">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-ink">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => applyParams({ in_stock: e.target.checked, page: 1 })}
                  className="h-4 w-4 rounded border-ivory-border text-forest focus:ring-forest"
                />
                In Stock Only
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-ink">
                <input
                  type="checkbox"
                  checked={discountedOnly}
                  onChange={(e) => applyParams({ discounted: e.target.checked, page: 1 })}
                  className="h-4 w-4 rounded border-ivory-border text-terracotta focus:ring-terracotta"
                />
                Active Artisan Offers Only
              </label>
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <div className="lg:col-span-9">
          <ErrorMessage message={error} />

          {loading ? (
            <Loading text="Loading handcrafted products..." />
          ) : products.length === 0 ? (
            <div className="card-surface px-6 py-16 text-center">
              <h2 className="font-serif text-xl font-semibold text-ink">
                No matching crafts found
              </h2>
              <p className="mt-1.5 text-sm text-ink-muted">
                Try clearing one or more filters to browse all available artisan pieces.
              </p>
              {hasActiveFilters && (
                <button type="button" onClick={handleClearFilters} className="btn-secondary mt-5">
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {(prevPage || nextPage) && (
                <div className="mt-10 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    disabled={!prevPage}
                    onClick={() => applyParams({ page: Math.max(1, page - 1) })}
                    className="btn-secondary"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <span className="text-sm font-medium text-ink-muted">Page {page}</span>
                  <button
                    type="button"
                    disabled={!nextPage}
                    onClick={() => applyParams({ page: page + 1 })}
                    className="btn-secondary"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}