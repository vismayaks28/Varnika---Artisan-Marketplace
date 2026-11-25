import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { productApi } from '../../../api/productApi';
import ProductCard from '../../../components/ProductCard';
import BrandCard from '../../../components/BrandCard';

const CURATED_COLLECTIONS = [
  {
    slug: 'home-decor',
    title: 'Handmade Home Decor',
    subtitle: 'Hand-thrown ceramics, brass accents, and carved wooden pieces for warm living spaces.',
    query: '?category=decor',
  },
  {
    slug: 'traditional-pottery',
    title: 'Traditional Pottery',
    subtitle: 'Terracotta, blue pottery, and studio stoneware shaped on regional wheels.',
    query: '?category=pottery',
  },
  {
    slug: 'handwoven-textiles',
    title: 'Handwoven Textiles',
    subtitle: 'Loom-woven cottons, block-printed linens, and heirloom weaves from Indian clusters.',
    query: '?category=textiles',
  },
  {
    slug: 'artisan-jewellery',
    title: 'Artisan Jewellery',
    subtitle: 'Hand-forged brass, silver, and beadwork crafted in small batches.',
    query: '?category=jewelry',
  },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    productApi
      .getProducts({ ordering: '-created_at' })
      .then((res) => {
        const items = res.data.results || res.data || [];
        setNewArrivals(items.slice(0, 4));
        setFeaturedProducts(items.slice(0, 8));
      })
      .catch(() => {});

    productApi
      .getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});

    productApi
      .getBrands()
      .then((res) => setBrands((res.data || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Editorial E-Commerce Hero */}
      <section className="border-b border-ivory-border bg-ivory-dark/70">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
              Authentic Indian Handicrafts &middot; Direct From Studios
            </p>
            <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-ink sm:text-5xl">
              Heirloom Indian crafts, made by independent hands and delivered to your home.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
              Shop wheel-thrown pottery, handloom textiles, hammered brassware, and carved woodwork
              directly from verified artisan workshops across India.
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link to="/shop" className="btn-primary px-6 py-3">
                <Compass className="h-4 w-4" />
                Shop Now
              </Link>
              <Link to="/categories" className="btn-secondary px-6 py-3">
                Explore Categories
              </Link>
            </div>
          </div>

          {/* Highlighted Craft Card */}
          <div className="lg:col-span-5">
            <div className="card-surface space-y-5 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-forest">
                Why Collectors Shop on Varnika
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="rounded-md bg-terracotta-light p-2 text-terracotta">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-serif text-base font-semibold text-ink">
                      Verified Artisan Studios
                    </h2>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                      Every brand undergoes manual workshop verification before publishing products.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="rounded-md bg-forest-light p-2 text-forest">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-serif text-base font-semibold text-ink">
                      Transparent Provenance
                    </h2>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                      See exact materials, craft techniques, dimensions, and the maker behind every piece.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="rounded-md bg-gold-light p-2 text-[#876423]">
                    <Truck className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-serif text-base font-semibold text-ink">
                      Direct Workshop Fulfillment
                    </h2>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                      Orders go straight to the artisan studio with live status updates from packing to delivery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
              Craft Traditions
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">Shop by Category</h2>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline"
          >
            All Categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.value}
              to={`/shop?category=${cat.value}`}
              className="card-surface group flex flex-col justify-between p-4 transition-colors hover:border-terracotta"
            >
              <span className="font-serif text-base font-semibold text-ink group-hover:text-terracotta">
                {cat.label}
              </span>
              <span className="mt-3 text-xs font-medium text-ink-muted">
                {cat.product_count} item{cat.product_count === 1 ? '' : 's'} &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Handcrafted Products */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
              Curated Selection
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">Featured Products</h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline"
          >
            Shop All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="card-surface mt-6 px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">
              No approved artisan products are published yet.
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Approved sellers can add handcrafted works from their Seller Studio.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Curated Collections */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
              Themed Edits
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">
              Curated Collections
            </h2>
          </div>
          <Link
            to="/collections"
            className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline"
          >
            View All Collections
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CURATED_COLLECTIONS.map((col) => (
            <Link
              key={col.slug}
              to={`/shop${col.query}`}
              className="card-surface group flex flex-col justify-between p-6 transition-shadow hover:shadow-md"
            >
              <div>
                <h3 className="font-serif text-lg font-semibold text-ink group-hover:text-terracotta">
                  {col.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{col.subtitle}</p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-forest">
                Explore Collection
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
                Fresh From the Workshop
              </p>
              <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">New Arrivals</h2>
            </div>
            <Link
              to="/shop?ordering=-created_at"
              className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline"
            >
              View Latest
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={`new-${product.id}`} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Explore Artisan Brands */}
      {brands.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
                Verified Studios
              </p>
              <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">
                Explore Artisan Brands
              </h2>
            </div>
            <Link
              to="/brands"
              className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline"
            >
              All Brands
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </section>
      )}

      {/* Brand Story Banner */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-ivory-border bg-forest px-6 py-12 text-ivory sm:px-12">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-light">
              Our Craft Manifesto
            </p>
            <h2 className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">
              Preserving living Indian craft traditions through fair, direct commerce.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ivory/85 sm:text-base">
              Varnika was created so independent potters, weavers, metalworkers, and studio brands
              can showcase their craft with complete transparency—telling the story of their
              materials and techniques while buyers shop with confidence.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/about" className="btn-primary">
                Read Our Story
              </Link>
              <Link
                to="/sell"
                className="inline-flex items-center justify-center rounded-md border border-ivory/30 px-4 py-2.5 text-sm font-semibold text-ivory hover:bg-white/10"
              >
                Apply as an Artisan Brand
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}