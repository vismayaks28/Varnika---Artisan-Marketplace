import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-ivory-border bg-ivory-dark">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-ink-muted sm:flex-row sm:px-6 lg:px-8">
        <div>
          <span className="font-serif font-semibold text-ink">Varnika</span> &middot; Handcrafted Marketplace &amp; Artisan Workspace
        </div>
        <div className="flex items-center gap-6">
          <Link to="/marketplace" className="hover:text-ink">
            Catalog
          </Link>
          <Link to="/privacy" className="hover:text-ink">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-ink">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}