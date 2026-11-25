import { Link } from 'react-router-dom';
import { ShieldCheck, Hammer, HeartHandshake } from 'lucide-react';

export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="card-surface space-y-8 p-8 sm:p-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Our Story &amp; Purpose
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-ink sm:text-4xl">
            About Varnika
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            Varnika is an Indian artisan marketplace built to connect independent craftspeople,
            rural studios, and heritage craft brands directly with buyers who value authentic
            handmade objects.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 border-y border-ivory-border py-8 md:grid-cols-3">
          <div>
            <span className="inline-flex rounded-md bg-terracotta-light p-2.5 text-terracotta">
              <Hammer className="h-5 w-5" />
            </span>
            <h2 className="mt-3 font-serif text-lg font-semibold text-ink">
              Craft-First Storytelling
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              Every listing documents the raw materials, regional craft technique, dimensions, and
              maker behind the piece.
            </p>
          </div>

          <div>
            <span className="inline-flex rounded-md bg-forest-light p-2.5 text-forest">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h2 className="mt-3 font-serif text-lg font-semibold text-ink">
              Verified Workshops
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              Artisan brands submit workshop details and verification evidence before publishing
              products to the storefront.
            </p>
          </div>

          <div>
            <span className="inline-flex rounded-md bg-gold-light p-2.5 text-[#876423]">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <h2 className="mt-3 font-serif text-lg font-semibold text-ink">
              Direct Studio Orders
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              Orders flow straight to the creator&apos;s workspace, keeping pricing fair and
              fulfillment transparent.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/shop" className="btn-primary">
            Explore the Shop
          </Link>
          <Link to="/brands" className="btn-secondary">
            Meet Our Artisans
          </Link>
        </div>
      </div>
    </div>
  );
}