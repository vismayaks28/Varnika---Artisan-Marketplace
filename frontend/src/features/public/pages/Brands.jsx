import { useEffect, useState } from 'react';
import { productApi } from '../../../api/productApi';
import { extractApiError } from '../../../utils/formatters';
import BrandCard from '../../../components/BrandCard';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    productApi
      .getBrands()
      .then((res) => setBrands(res.data || []))
      .catch((err) => setError(extractApiError(err, 'Unable to load artisan brands.').message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Loading verified artisan brands..." />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-ivory-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
          Verified Maker Directory
        </p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
          Artisans &amp; Handcrafted Brands
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Every brand listed here has completed Varnika&apos;s workshop verification process. Explore their stories and collections.
        </p>
      </div>

      <div className="mt-6">
        <ErrorMessage message={error} />
      </div>

      {brands.length === 0 ? (
        <div className="card-surface mt-6 px-6 py-14 text-center">
          <p className="text-sm font-medium text-ink">
            No verified artisan brands are published yet.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      )}
    </div>
  );
}