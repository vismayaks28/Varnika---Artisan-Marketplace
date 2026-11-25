import { Link, Navigate } from 'react-router-dom';
import { Store, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SellLanding() {
  const { isAuthenticated, isSeller, isBuyer } = useAuth();

  if (isAuthenticated && isSeller) {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="card-surface p-8 sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest">
          Varnika Artisan Partner Program
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink sm:text-4xl">
          Sell Your Handcrafted Works on Varnika
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
          We partner with independent Indian artisans, family workshops, and craft studios. Submit
          your brand and workshop verification application to open your digital storefront.
        </p>

        {isAuthenticated && isBuyer && (
          <div className="mt-6 rounded-md border border-[#E4D2A8] bg-gold-light px-4 py-3 text-sm text-[#876423]">
            You are currently signed in with a <strong>Buyer</strong> account. Sign out first if you
            wish to sign in or apply with an <strong>Artisan / Seller</strong> account.
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-ivory-border bg-ivory p-6">
            <span className="inline-flex rounded-md bg-forest-light p-2.5 text-forest">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-serif text-xl font-semibold text-ink">
              Apply to Become a Seller
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              New to Varnika? Submit your personal, brand, workshop address, and verification
              documents for manual review by our craft curation team.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-ink">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-forest" />
                Dedicated public Brand Profile page
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-forest" />
                Full inventory, offers &amp; order fulfillment ledger
              </li>
            </ul>
            <Link to="/seller/apply" className="btn-forest mt-6 w-full py-2.5">
              Start Seller Application
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-lg border border-ivory-border bg-white p-6">
            <span className="inline-flex rounded-md bg-terracotta-light p-2.5 text-terracotta">
              <Store className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-serif text-xl font-semibold text-ink">
              Existing Seller Sign In
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Already submitted an application or managing an approved Varnika studio? Sign in to
              check your verification status, products, and orders.
            </p>
            <Link to="/seller/login" className="btn-secondary mt-6 w-full py-2.5">
              Seller Studio Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}