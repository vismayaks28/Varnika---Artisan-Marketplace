import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, MapPin, Award, Globe } from 'lucide-react';
import { productApi } from '../../../api/productApi';
import { extractApiError, resolveImageUrl } from '../../../utils/formatters';
import ProductCard from '../../../components/ProductCard';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';

export default function BrandDetails() {
  const { id } = useParams();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    productApi
      .getBrandById(id)
      .then((res) => setBrand(res.data))
      .catch((err) => setError(extractApiError(err, 'Brand profile not found.').message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading text="Loading brand studio profile..." />;
  if (error || !brand) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <ErrorMessage message={error || 'Brand not found.'} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/brands"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to All Brands
      </Link>

      {/* Brand Header Banner */}
      <div className="card-surface mt-6 p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {brand.brand_logo ? (
            <img
              src={resolveImageUrl(brand.brand_logo)}
              alt={brand.brand_name}
              className="h-24 w-24 shrink-0 rounded-lg border border-ivory-border object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-terracotta-light font-serif text-3xl font-bold text-terracotta">
              {brand.brand_name?.[0]?.toUpperCase() || 'V'}
            </div>
          )}

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
                {brand.brand_name}
              </h1>
              {brand.is_verified && (
                <span className="inline-flex items-center gap-1 rounded bg-forest-light px-2.5 py-1 text-xs font-semibold text-forest">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified Artisan Studio
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {brand.manufacturing_location}
              </span>
              {brand.craft_specialty && (
                <span className="inline-flex items-center gap-1 font-medium text-forest">
                  <Award className="h-3.5 w-3.5" />
                  {brand.craft_specialty}
                </span>
              )}
              {brand.years_of_experience != null && (
                <span>{brand.years_of_experience}+ years of craft practice</span>
              )}
              {brand.website_or_social && (
                <a
                  href={brand.website_or_social}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-terracotta hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Studio Link
                </a>
              )}
            </div>

            <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-ink">
              {brand.brand_description}
            </p>
            <p className="mt-3 text-xs text-ink-muted">
              Lead Artisan: <span className="font-semibold text-ink">{brand.artisan_name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Brand Products */}
      <div className="mt-10">
        <h2 className="font-serif text-2xl font-semibold text-ink">
          Handcrafted Works by {brand.brand_name} ({brand.products?.length || 0})
        </h2>

        {!brand.products || brand.products.length === 0 ? (
          <div className="card-surface mt-6 px-6 py-12 text-center">
            <p className="text-sm text-ink-muted">
              This brand has not published any available products yet.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {brand.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}