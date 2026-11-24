import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  MessageSquare,
  UserCircle,
  LogOut,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SELLER_LINKS = [
  { to: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/seller/products/add', label: 'Add Product', icon: PlusCircle },
  { to: '/seller/products', label: 'Manage Products', icon: Package, end: true },
  { to: '/seller/enquiries', label: 'Enquiries', icon: MessageSquare },
  { to: '/seller/profile', label: 'Profile & Security', icon: UserCircle },
];

export default function SellerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="card-surface p-4">
            <div className="border-b border-ivory-border pb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Artisan Studio
              </p>
              <p className="mt-1 font-serif text-lg font-semibold text-ink">
                {user?.full_name}
              </p>
              <p className="text-xs text-ink-muted">{user?.location}</p>
            </div>

            <nav className="mt-4 flex flex-col gap-1">
              {SELLER_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-forest text-white'
                          : 'text-ink-muted hover:bg-ivory-dark hover:text-ink'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </NavLink>
                );
              })}

              <NavLink
                to="/marketplace"
                className="mt-2 flex items-center gap-2.5 rounded-md border-t border-ivory-border px-3 pt-3.5 pb-2 text-sm font-medium text-ink-muted hover:text-ink"
              >
                <Compass className="h-4 w-4 shrink-0" />
                Browse Marketplace
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm font-medium text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Logout
              </button>
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}