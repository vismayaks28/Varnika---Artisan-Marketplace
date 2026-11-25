import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { isAuthenticated, isSeller } = useAuth();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="mt-auto border-t border-ivory-border bg-ivory-dark text-ink">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-terracotta font-serif text-base font-bold text-white">
                V
              </span>
              <span className="font-serif text-xl font-semibold text-ink">Varnika</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
              An Indian artisan marketplace connecting verified regional craft studios directly
              with thoughtful homes and collectors.
            </p>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink">
                Craft Journal &amp; Studio Updates
              </p>
              {subscribed ? (
                <p className="mt-2 rounded-md border border-[#BFD6C9] bg-forest-light px-3 py-2 text-xs font-medium text-forest">
                  Thank you. Your email has been saved to our local studio digest list.
                </p>
              ) : (
                <form onSubmit={handleNewsletter} className="mt-2 flex max-w-sm">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full rounded-l-md border border-ivory-border bg-white px-3 py-2 text-sm text-ink focus:border-forest focus:outline-none"
                  />
                  <button type="submit" className="btn-primary rounded-l-none py-2 text-xs">
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
              Marketplace
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm text-ink-muted">
              <li>
                <Link to="/shop" className="hover:text-terracotta">
                  Shop All Crafts
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-terracotta">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-terracotta">
                  Curated Collections
                </Link>
              </li>
              <li>
                <Link to="/brands" className="hover:text-terracotta">
                  Artisans &amp; Brands
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
              Customer Care
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm text-ink-muted">
              <li>
                <Link to="/shipping-policy" className="hover:text-terracotta">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="hover:text-terracotta">
                  Return &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-terracotta">
                  Help &amp; FAQs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-terracotta">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Sell on Varnika */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
              Company &amp; Artisans
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm text-ink-muted">
              <li>
                <Link to="/about" className="hover:text-terracotta">
                  About Varnika
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-terracotta">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-terracotta">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  to={isAuthenticated && isSeller ? '/seller/dashboard' : '/sell'}
                  className="font-semibold text-forest hover:underline"
                >
                  Sell on Varnika &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-ivory-border pt-6 text-xs text-ink-muted sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Varnika Artisan Marketplace. Crafted in India.</p>
          <div className="flex gap-5">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-ink">
              Instagram
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-ink">
              Pinterest
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}