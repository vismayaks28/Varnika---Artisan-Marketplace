import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  Package,
  AlertTriangle,
  PlusCircle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { sellerApi } from '../../../api/sellerApi';
import { extractApiError, formatCurrency, formatDate } from '../../../utils/formatters';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import StatusBadge from '../../../components/StatusBadge';

export default function SellerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    sellerApi
      .getDashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(extractApiError(err, 'Failed to load seller studio metrics.').message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Loading your artisan studio..." />;
  if (error) return <ErrorMessage message={error} />;

  const isApproved = data.verification_status === 'approved';

  const metrics = [
    {
      label: 'Total Studio Sales',
      value: formatCurrency(data.total_sales),
      icon: IndianRupee,
      accent: 'text-forest bg-forest-light',
    },
    {
      label: 'Pending Orders',
      value: data.pending_orders,
      icon: ShoppingBag,
      accent: 'text-terracotta bg-terracotta-light',
    },
    {
      label: 'Active Products',
      value: `${data.available_products} / ${data.total_products}`,
      icon: Package,
      accent: 'text-ink bg-ivory-dark',
    },
    {
      label: 'Low Stock Alerts',
      value: data.low_stock_products,
      icon: AlertTriangle,
      accent: 'text-[#876423] bg-gold-light',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Studio Ledger
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">
            {data.brand_name || 'Seller Dashboard'}
          </h1>
        </div>

        {isApproved && (
          <Link to="/seller/products/add" className="btn-primary">
            <PlusCircle className="h-4 w-4" />
            Add Handcrafted Product
          </Link>
        )}
      </div>

      {/* Verification Status Banner */}
      {data.verification_status === 'pending' && (
        <div className="rounded-lg border border-[#E4D2A8] bg-gold-light p-5 text-[#876423]">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h2 className="font-serif text-base font-semibold">
                Seller Application Under Verification Review
              </h2>
              <p className="mt-1 text-sm leading-relaxed">
                Our curation team is reviewing your brand profile and verification documents. You can
                update your{' '}
                <Link to="/seller/brand" className="font-semibold underline">
                  Brand Profile
                </Link>{' '}
                now; product publishing unlocks automatically once your application is approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {data.verification_status === 'info_required' && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h2 className="font-serif text-base font-semibold">
                Additional Verification Information Requested
              </h2>
              <p className="mt-1 text-sm">
                {data.admin_notes || 'Please review and update your brand and workshop details.'}
              </p>
              <Link to="/seller/brand" className="btn-secondary mt-3 py-1.5 text-xs">
                Update Brand &amp; Workshop Profile
              </Link>
            </div>
          </div>
        </div>
      )}

      {data.verification_status === 'rejected' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-900">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h2 className="font-serif text-base font-semibold">
                Seller Application Not Approved
              </h2>
              <p className="mt-1 text-sm">
                {data.admin_notes ||
                  'Your application did not meet our handcrafted studio verification guidelines. Contact support@varnikacrafts.in for clarification.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {isApproved && (
        <div className="flex items-center gap-2 rounded-md border border-[#BFD6C9] bg-forest-light px-4 py-2.5 text-xs font-semibold text-forest">
          <CheckCircle2 className="h-4 w-4" />
          Verified Artisan Studio &middot; Your published products are live on the Varnika storefront
        </div>
      )}

      {/* Real Database Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="card-surface p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  {item.label}
                </span>
                <span className={`rounded-md p-2 ${item.accent}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 font-serif text-2xl font-semibold text-ink">{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Customer Orders */}
      <div className="card-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-ivory-border px-6 py-4">
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">Recent Customer Orders</h2>
            <p className="text-xs text-ink-muted">
              Items ordered from your studio ({data.completed_orders} delivered)
            </p>
          </div>
          <Link
            to="/seller/orders"
            className="inline-flex items-center gap-1 text-sm font-semibold text-terracotta hover:underline"
          >
            Manage Orders
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {!data.recent_orders || data.recent_orders.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm font-medium text-ink">No customer orders received yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-ivory-border">
            {data.recent_orders.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-3 px-6 py-4 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif text-sm font-semibold text-ink">
                      {item.order_number}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 text-sm text-ink">
                    {item.product_name} &times; {item.quantity}
                  </p>
                  <p className="text-xs text-ink-muted">
                    Buyer: {item.buyer_name} &middot; {formatDate(item.order_date)}
                  </p>
                </div>
                <div className="font-serif text-base font-semibold text-forest">
                  {formatCurrency(item.line_total)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}