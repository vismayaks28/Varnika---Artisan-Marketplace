import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
  Package,
  Store,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

export default function Navbar() {
  const { user, isAuthenticated, isBuyer, isSeller, logout } = useAuth();
  const { cartCount, wishlistCount } = useStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    navigate(trimmed ? `/shop?search=${encodeURIComponent(trimmed)}` : '/shop');
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-terracotta font-semibold' : 'text-ink-muted hover:text-ink'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-ivory-border bg-white/95 backdrop-blur">
      {/* Subtle Top Announcement Bar */}
      <div className="bg-forest px-4 py-1.5 text-center text-xs font-medium text-ivory">
        Complimentary shipping across India on orders above ₹2,000 &middot; Direct from Verified Artisan Studios
      </div>

      {/* Main Header Row */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-terracotta font-serif text-lg font-bold text-white">
            V
          </span>
          <div>
            <span className="font-serif text-xl font-semibold tracking-tight text-ink">
              Varnika
            </span>
            <span className="hidden text-[11px] font-medium uppercase tracking-widest text-ink-muted sm:block">
              Handcrafted India
            </span>
          </div>
        </Link>

        {/* Desktop Search Bar */}
        <form onSubmit={handleSearch} className="hidden max-w-md flex-1 md:flex">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pottery, handloom, brassware, or artisan brand..."
              className="w-full rounded-l-md border border-ivory-border bg-ivory/60 py-2 pr-3 pl-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-forest focus:bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-r-md bg-terracotta px-4 text-white transition-colors hover:bg-terracotta-hover"
            aria-label="Search crafts"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>

        {/* Right Action Icons (Wishlist, Cart, Account) */}
        <div className="flex items-center gap-3 sm:gap-5">
          {!isSeller && (
            <>
              <Link
                to={isAuthenticated && isBuyer ? '/buyer/wishlist' : '/login'}
                className="relative inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-terracotta"
                title="Wishlist"
              >
                <Heart className="h-5 w-5" />
                <span className="hidden lg:inline">Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="rounded-full bg-terracotta-light px-1.5 py-0.5 text-[11px] font-bold text-terracotta">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to={isAuthenticated && isBuyer ? '/buyer/cart' : '/login'}
                className="relative inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-terracotta"
                title="Shopping Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="hidden lg:inline">Cart</span>
                <span className="rounded-full bg-forest px-1.5 py-0.5 text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              </Link>
            </>
          )}

          {!isAuthenticated ? (
            <div className="hidden items-center gap-2.5 sm:flex">
              <Link to="/login" className="btn-secondary py-2 text-xs">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary py-2 text-xs">
                Create Account
              </Link>
            </div>
          ) : isBuyer ? (
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                to="/buyer/dashboard"
                className="inline-flex items-center gap-1.5 rounded-md border border-ivory-border bg-ivory px-3 py-1.5 text-xs font-semibold text-ink hover:border-forest"
              >
                <User className="h-3.5 w-3.5 text-forest" />
                {user.first_name || 'My Account'}
              </Link>
              <Link
                to="/buyer/orders"
                className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-ink"
              >
                <Package className="h-4 w-4" />
                Orders
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-terracotta"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                to="/seller/dashboard"
                className="inline-flex items-center gap-1.5 rounded-md bg-forest px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest-hover"
              >
                <Store className="h-3.5 w-3.5" />
                Seller Studio
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-terracotta"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="rounded-md border border-ivory-border p-2 text-ink md:hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Secondary Category & Storefront Navigation Row */}
      <nav className="hidden border-t border-ivory-border bg-ivory/70 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-7">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/shop" className={navLinkClass}>
              Shop All
            </NavLink>
            <NavLink to="/categories" className={navLinkClass}>
              Categories
            </NavLink>
            <NavLink to="/collections" className={navLinkClass}>
              Collections
            </NavLink>
            <NavLink to="/brands" className={navLinkClass}>
              Artisans &amp; Brands
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About Varnika
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              Contact
            </NavLink>
          </div>
          <Link
            to="/shop?discounted=true"
            className="text-xs font-semibold text-terracotta hover:underline"
          >
            Artisan Offers
          </Link>
        </div>
      </nav>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="space-y-4 border-t border-ivory-border bg-white px-4 py-4 md:hidden">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search handcrafted products..."
              className="w-full rounded-l-md border border-ivory-border px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-r-md bg-terracotta px-3.5 text-white"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2.5 text-sm">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-1 font-medium text-ink">
              Home
            </Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="py-1 font-medium text-ink">
              Shop All
            </Link>
            <Link to="/categories" onClick={() => setMobileMenuOpen(false)} className="py-1 font-medium text-ink">
              Categories
            </Link>
            <Link to="/collections" onClick={() => setMobileMenuOpen(false)} className="py-1 font-medium text-ink">
              Collections
            </Link>
            <Link to="/brands" onClick={() => setMobileMenuOpen(false)} className="py-1 font-medium text-ink">
              Artisans &amp; Brands
            </Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="py-1 font-medium text-ink">
              About Varnika
            </Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="py-1 font-medium text-ink">
              Contact
            </Link>
          </div>

          <div className="border-t border-ivory-border pt-3">
            {!isAuthenticated ? (
              <div className="flex gap-2.5">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary flex-1">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary flex-1">
                  Create Account
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <Link
                  to={isSeller ? '/seller/dashboard' : '/buyer/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-forest"
                >
                  {isSeller ? 'Open Seller Studio' : `My Account (${user.first_name})`}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-semibold text-terracotta"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}