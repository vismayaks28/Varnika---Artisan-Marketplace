import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isSeller, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/login');
  };

  const dashboardPath = isSeller ? '/seller/dashboard' : '/buyer/dashboard';

  return (
    <header className="sticky top-0 z-40 border-b border-ivory-border bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-terracotta font-serif text-lg font-bold text-white">
              V
            </span>
            <div>
              <span className="font-serif text-xl font-semibold tracking-tight text-ink">
                Varnika
              </span>
              <span className="ml-2 hidden text-xs font-medium uppercase tracking-widest text-ink-muted sm:inline">
                Artisan Marketplace
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLink
              to="/marketplace"
              className={({ isActive }) =>
                `flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'text-terracotta' : 'text-ink-muted hover:text-ink'
                }`
              }
            >
              <Compass className="h-4 w-4" />
              Explore Crafts
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to={dashboardPath}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    isActive ? 'text-terracotta' : 'text-ink-muted hover:text-ink'
                  }`
                }
              >
                <LayoutDashboard className="h-4 w-4" />
                {isSeller ? 'Seller Workspace' : 'Buyer Dashboard'}
              </NavLink>
            )}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-ink-muted">
                {user.full_name}{' '}
                <span className="rounded bg-ivory-dark px-2 py-0.5 text-xs font-semibold capitalize text-forest">
                  {user.role}
                </span>
              </span>
              <button onClick={handleLogout} className="btn-secondary py-2">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary py-2">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary py-2">
                Create Account
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md border border-ivory-border p-2 text-ink md:hidden"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-ivory-border bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              to="/marketplace"
              onClick={() => setMobileOpen(false)}
              className="py-1.5 text-sm font-medium text-ink"
            >
              Explore Crafts
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileOpen(false)}
                  className="py-1.5 text-sm font-medium text-ink"
                >
                  {isSeller ? 'Seller Workspace' : 'Buyer Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-secondary mt-2 w-full justify-center"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary w-full"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}