import { Link } from 'react-router-dom';
import { MapPin, BadgeCheck, ArrowRight } from 'lucide-react';
import { resolveImageUrl } from '../utils/formatters';

export default function BrandCard({ brand }) {
  return (
    <div className="card-surface flex flex-col justify-between p-6 transition-shadow hover:shadow-md">
      <div>
        <div className="flex items-center gap-3.5">
          {brand.brand_logo ? (
            <img
              src={resolveImageUrl(brand.brand_logo)}
              alt={brand.brand_name}
              className="h-14 w-14 shrink-0 rounded-md border border-ivory-border object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-terracotta-light font-serif text-xl font-bold text-terracotta">
              {brand.brand_name?.[0]?.toUpperCase() || 'V'}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-serif text-lg font-semibold text-ink">
                {brand.brand_name}
              </h3>
              {brand.is_verified && (
                <BadgeCheck
                  className="h-4 w-4 shrink-0 text-forest"
                  title="Verified Artisan Brand"
                />
              )}
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{brand.manufacturing_location}</span>
            </p>
          </div>
        </div>

        {brand.craft_specialty && (
          <p className="mt-3 inline-block rounded bg-ivory-dark px-2.5 py-1 text-xs font-semibold text-forest">
            {brand.craft_specialty}
          </p>
        )}

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-muted">
          {brand.brand_description || `Independent Indian craft studio led by ${brand.artisan_name}.`}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-ivory-border pt-3.5">
        <span className="text-xs font-medium text-ink-muted">
          {brand.product_count} handcrafted work{brand.product_count === 1 ? '' : 's'}
        </span>
        <Link
          to={`/brands/${brand.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta hover:underline"
        >
          Explore Brand
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}