import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Package, MessageSquare, Clock, CheckCircle, ArrowRight } from 'lucide-react';
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
    let active = true;
    sellerApi
      .getDashboard()
      .then((res) => {
        if (active) setData(res.data);
      })
      .catch((err) => {
        if (active) setError(extractApiError(err, 'Failed to load seller dashboard.').message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loading text="Loading studio overview..." />;
  if (error) return <ErrorMessage message={error} />;

  const metrics = [
    {
      label: 'Total Products Listed',
      value: data.total_products,
      subtext: `${data.available_products} currently available`,
      icon: Package,
      accent: 'text-forest bg-forest-light',
    },
    {
      label: 'Total Enquiries Received',
      value: data.total_enquiries,
      subtext: `${data.completed_enquiries} completed orders`,
      icon: MessageSquare,
      accent: 'text-terracotta bg-terracotta-light',
    },
    {
      label: 'Pending Enquiries',
      value: data.pending_enquiries,
      subtext: 'Awaiting your review',
      icon: Clock,
      accent: 'text-[#876423] bg-gold-light',
    },
    {
      label: 'Accepted Enquiries',
      value: data.accepted_enquiries,
      subtext: 'In progress with buyers',
      icon: CheckCircle,
      accent: 'text-forest bg-forest-light',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Studio Overview
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">
            Seller Dashboard
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/seller/products/add" className="btn-primary">
            <PlusCircle className="h-4 w-4" />
            Add New Product
          </Link>
          <Link to="/seller/products" className="btn-secondary">
            Manage Products
          </Link>
        </div>
      </div>

      {/* Real Database Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              <p className="mt-3 font-serif text-3xl font-semibold text-ink">{item.value}</p>
              <p className="mt-1 text-xs text-ink-muted">{item.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Enquiries */}
      <div className="card-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-ivory-border px-6 py-4">
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">Recent Buyer Enquiries</h2>
            <p className="text-xs text-ink-muted">
              Latest requests submitted on your published crafts
            </p>
          </div>
          <Link
            to="/seller/enquiries"
            className="inline-flex items-center gap-1 text-sm font-semibold text-terracotta hover:underline"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {data.recent_enquiries.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">No enquiries received yet.</p>
            <p className="mt-1 text-xs text-ink-muted">
              Publish handcrafted items to start receiving direct enquiries from buyers.
            </p>
            <Link to="/seller/products/add" className="btn-primary mt-4">
              List Your First Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ivory-border bg-ivory-dark text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-6 py-3 font-semibold">Product</th>
                  <th className="px-6 py-3 font-semibold">Buyer</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-border">
                {data.recent_enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-ivory/60">
                    <td className="px-6 py-4">
                      <div className="font-medium text-ink">{enq.product_name}</div>
                      <div className="text-xs text-ink-muted">
                        {formatCurrency(enq.product_price)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-ink">{enq.buyer_name}</div>
                      <div className="text-xs text-ink-muted">{enq.buyer_location}</div>
                    </td>
                    <td className="px-6 py-4 text-ink-muted">{formatDate(enq.created_at)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={enq.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/seller/enquiries/${enq.id}`}
                        className="font-semibold text-forest hover:underline"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}