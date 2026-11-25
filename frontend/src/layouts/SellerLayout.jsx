import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  PlusCircle,
  Store,
  MessageSquare,
  UserCog,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SELLER_LINKS = [
  { to: '/seller/dashboard', label: 'Studio Overview', icon: LayoutDashboard },
  { to: '/seller/orders', label: 'Customer Orders', icon: ShoppingBag },
  { to: '/seller/products', label: 'My Products', icon: Package },
  { to: '/seller/products/add', label: 'Add New Product', icon: PlusCircle },
  { to: '/seller/brand', label: 'Brand Profile', icon: Store },
  { to: '/seller/enquiries', label: 'Custom Enquiries', icon: MessageSquare },
  { to: '/seller/profile', label: 'Account & Password', icon: UserCog },
];

export default function SellerLayout() {
  const { user } = useAuth();
  const brandName = user?.seller_profile?.brand_name || user?.full_name;

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="card-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
              Artisan Studio
            </p>
            <p className="mt-1 font-serif text-lg font-semibold text-ink">{brandName}</p>
            <p className="text-xs text-ink-muted">{user?.location}</p>

            <nav className="mt-5 space-y-1 border-t border-ivory-border pt-4">
              {SELLER_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/seller/products'}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-terracotta text-white'
                          : 'text-ink-muted hover:bg-ivory-dark hover:text-ink'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
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