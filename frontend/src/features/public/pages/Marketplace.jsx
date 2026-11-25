import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { productApi } from '../../../api/productApi';
import { extractApiError, formatCurrency, resolveImageUrl } from '../../../utils/formatters';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '-created_at');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    if (location.trim()) params.location = location.trim();

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
        setError(extractApiError(err, 'Unable to load marketplace catalog.').message);
      })
      .finally(() => setLoading(false));
  }, [search, category, location, ordering, page]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    const nextParams = {};
    if (search.trim()) nextParams.search = search.trim();
    if (category) nextParams.category = category;
    if (location.trim()) nextParams.location = location.trim();
    if (ordering !== '-created_at') nextParams.ordering = ordering;
    setSearchParams(nextParams);
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setOrdering('-created_at');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-ivory-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
          Handcrafted Catalog
        </p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
          Explore Artisan Works
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Showing {count} available handcrafted item{count === 1 ? '' : 's'} across India.
        </p>
      </div>

      {/* Search, Filter & Sort Controls */}
      <form
        onSubmit={handleFilterSubmit}
        className="card-surface mt-6 grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-ink-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search craft, material, or artisan..."
            className="input-field pl-9"
          />
        </div>

        <div>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="input-field"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="text"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by city/state..."
            className="input-field"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={ordering}
            onChange={(e) => {
              setOrdering(e.target.value);
              setPage(1);
            }}
            className="input-field"
          >
            <option value="-created_at">Newest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        {(search || category || location || ordering !== '-created_at') && (
          <div className="flex items-center justify-between border-t border-ivory-border pt-3 sm:col-span-2 lg:col-span-5">
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Active catalog filters applied
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-terracotta hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </form>

      <div className="mt-6">
        <ErrorMessage message={error} />
      </div>

      {loading ? (
        <Loading text="Loading handcrafted catalog..." />
      ) : products.length === 0 ? (
        <div className="card-surface mt-6 px-6 py-14 text-center">
          <h2 className="font-serif text-lg font-semibold text-ink">No matching crafts found</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Try adjusting your search keywords, category, or region filter.
          </p>
          <button type="button" onClick={handleReset} className="btn-secondary mt-4">
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="card-surface group overflow-hidden transition-shadow hover:shadow-md"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-ivory-dark">
                  <img
                    src={resolveImageUrl(product.image)}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-ink-muted">
                    <span>{product.category_display}</span>
                    <span>{product.location}</span>
                  </div>
                  <h2 className="mt-1.5 font-serif text-lg font-semibold text-ink group-hover:text-terracotta">
                    {product.name}
                  </h2>
                  <div className="mt-3 flex items-center justify-between border-t border-ivory-border pt-3">
                    <span className="text-xs text-ink-muted">By {product.seller_name}</span>
                    <span className="font-semibold text-ink">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {(prevPage || nextPage) && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={!prevPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-secondary"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <span className="text-sm font-medium text-ink-muted">Page {page}</span>
              <button
                type="button"
                disabled={!nextPage}
                onClick={() => setPage((p) => p + 1)}
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
  );
}