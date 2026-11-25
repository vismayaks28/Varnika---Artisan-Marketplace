import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Package,
  ShoppingBag,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { orderApi } from '../../../api/orderApi';
import { useStore } from '../../../context/StoreContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import Loading from '../../../components/Loading';
import StatusBadge from '../../../components/StatusBadge';

export default function BuyerDashboard() {
  const { cartCount, wishlistCount } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi
      .getOrders()
      .then((res) => setOrders(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Loading your account overview..." />;

  const metrics = [
    {
      label: 'Orders Placed',
      value: orders.length,
      to: '/buyer/orders',
      icon: Package,
      accent: 'text-forest bg-forest-light',
    },
    {
      label: 'Items in Cart',
      value: cartCount,
      to: '/buyer/cart',
      icon: ShoppingBag,
      accent: 'text-terracotta bg-terracotta-light',
    },
    {
      label: 'Saved Wishlist',
      value: wishlistCount,
      to: '/buyer/wishlist',
      icon: Heart,
      accent: 'text-[#876423] bg-gold-light',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Collector Overview
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">
            My Account
          </h1>
        </div>
        <Link to="/shop" className="btn-primary">
          <Compass className="h-4 w-4" />
          Shop Handcrafted Works
        </Link>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} to={item.to} className="card-surface p-5 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  {item.label}
                </span>
                <span className={`rounded-md p-2 ${item.accent}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 font-serif text-3xl font-semibold text-ink">{item.value}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="card-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-ivory-border px-6 py-4">
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">Recent Orders</h2>
            <p className="text-xs text-ink-muted">Track fulfillment across artisan studios</p>
          </div>
          <Link
            to="/buyer/orders"
            className="inline-flex items-center gap-1 text-sm font-semibold text-terracotta hover:underline"
          >
            All Orders
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">You have not placed any orders yet.</p>
            <p className="mt-1 text-xs text-ink-muted">
              Browse our curated Indian handicrafts and place your first order.
            </p>
            <Link to="/shop" className="btn-primary mt-4">
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-ivory-border">
            {orders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                to={`/buyer/orders/${order.order_number}`}
                className="flex flex-col justify-between gap-3 px-6 py-4 transition-colors hover:bg-ivory/60 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-serif text-base font-semibold text-ink">
                      {order.order_number}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    Placed {formatDate(order.created_at)} &middot; {order.items.length} item(s)
                  </p>
                </div>
                <div className="font-serif text-base font-semibold text-terracotta">
                  {formatCurrency(order.total_amount)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}