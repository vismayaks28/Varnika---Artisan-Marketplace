import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, ShieldCheck, MessageSquare } from 'lucide-react';
import { productApi } from '../../../api/productApi';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency, resolveImageUrl } from '../../../utils/formatters';

export default function Home() {
  const { isAuthenticated, isSeller } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    productApi
      .getProducts({ ordering: '-created_at' })
      .then((res) => {
        const items = res.data.results || res.data || [];
        setFeaturedProducts(items.slice(0, 6));
      })
      .catch(() => {});

    productApi
      .getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Editorial Hero */}
      <section className="border-b border-ivory-border bg-ivory-dark/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
              Direct From Indian Artisan Studios
            </p>
            <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-ink sm:text-5xl">
              Discover authentic handmade crafts and connect directly with their makers.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
              Varnika gives independent artisans a structured workspace to publish handcrafted works
              and respond directly to collector and buyer enquiries without intermediaries.
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link to="/marketplace" className="btn-primary px-6 py-3">
                <Compass className="h-4 w-4" />
                Explore Handcrafted Catalog
              </Link>
              {!isAuthenticated ? (
                <Link to="/register?role=seller" className="btn-secondary px-6 py-3">
                  Open an Artisan Studio
                </Link>
              ) : (
                <Link
                  to={isSeller ? '/seller/dashboard' : '/buyer/dashboard'}
                  className="btn-secondary px-6 py-3"
                >
                  Go to Your Workspace
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How Varnika Works */}
      <section className="border-b border-ivory-border bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          <div className="flex items-start gap-3.5">
            <span className="rounded-md bg-terracotta-light p-2.5 text-terracotta">
              <Compass className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-serif text-base font-semibold text-ink">
                Verified Craft Listings
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Browse pottery, handloom textiles, brassware, and woodwork listed directly by regional artisans.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <span className="rounded-md bg-forest-light p-2.5 text-forest">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-serif text-base font-semibold text-ink">
                Direct Artisan Enquiries
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Submit customization or purchase enquiries directly to the craftsperson and track responses.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <span className="rounded-md bg-gold-light p-2.5 text-[#876423]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-serif text-base font-semibold text-ink">
                Dedicated Studio Ledger
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Artisans manage availability, product galleries, and order status updates in one clear dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Strip */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-ink">Browse by Craft Tradition</h2>
            <Link
              to="/marketplace"
              className="text-sm font-semibold text-terracotta hover:underline"
            >
              All Categories
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {categories.map((cat) => (
              <Link
                key={cat.value}
                to={`/marketplace?category=${cat.value}`}
                className="rounded-md border border-ivory-border bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-terracotta hover:text-terracotta"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Available Crafts */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
              Recently Added
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">
              Available Handcrafted Works
            </h2>
          </div>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:underline"
          >
            View Full Catalog
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="card-surface mt-6 px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">
              No handcrafted products have been published yet.
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Register as an artisan to list your first handmade piece on Varnika.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
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
                  <h3 className="mt-1.5 font-serif text-lg font-semibold text-ink group-hover:text-terracotta">
                    {product.name}
                  </h3>
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
        )}
      </section>
    </div>
  );
}