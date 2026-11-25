import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, MessageSquare, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { buyerApi } from '../../../api/buyerApi';
import {
  extractApiError,
  formatCurrency,
  formatDate,
  resolveImageUrl,
} from '../../../utils/formatters';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import StatusBadge from '../../../components/StatusBadge';

export default function BuyerDashboard() {
  const [data, setData] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('varnika_recently_viewed') || '[]');
    setRecentlyViewed(saved);

    buyerApi
      .getDashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(extractApiError(err, 'Failed to load buyer dashboard.').message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Loading your dashboard..." />;
  if (error) return <ErrorMessage message={error} />;

  const metrics = [
    {
      label: 'Total Enquiries Sent',
      value: data.total_enquiries,
      icon: MessageSquare,
      accent: 'text-terracotta bg-terracotta-light',
    },
    {
      label: 'Pending Artisan Review',
      value: data.pending_enquiries,
      icon: Clock,
      accent: 'text-[#876423] bg-gold-light',
    },
    {
      label: 'Accepted Enquiries',
      value: data.accepted_enquiries,
      icon: CheckCircle,
      accent: 'text-forest bg-forest-light',
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
            Buyer Dashboard
          </h1>
        </div>
        <Link to="/marketplace" className="btn-primary">
          <Compass className="h-4 w-4" />
          Browse Handcrafted Catalog
        </Link>
      </div>

      {/* Real Database Enquiry Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            </div>
          );
        })}
      </div>

      {/* Recent Enquiries */}
      <div className="card-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-ivory-border px-6 py-4">
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">Recent Enquiries</h2>
            <p className="text-xs text-ink-muted">Track artisan responses on your requests</p>
          </div>
          <Link
            to="/buyer/enquiries"
            className="inline-flex items-center gap-1 text-sm font-semibold text-terracotta hover:underline"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {data.recent_enquiries.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">You have not sent any enquiries yet.</p>
            <p className="mt-1 text-xs text-ink-muted">
              Explore the catalog and reach out directly to artisans on any craft piece.
            </p>
            <Link to="/marketplace" className="btn-primary mt-4">
              Explore Crafts
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-ivory-border">
            {data.recent_enquiries.map((enq) => (
              <div
                key={enq.id}
                className="flex flex-col justify-between gap-4 px-6 py-4 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                      to={`/products/${enq.product_id}`}
                      className="font-serif text-base font-semibold text-ink hover:text-terracotta"
                    >
                      {enq.product_name}
                    </Link>
                    <StatusBadge status={enq.status} />
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    Artisan: {enq.seller_name} ({enq.seller_location}) &middot;{' '}
                    {formatDate(enq.created_at)}
                  </p>
                  {enq.seller_response && (
                    <p className="mt-2 rounded bg-ivory px-3 py-2 text-xs text-ink">
                      <span className="font-semibold text-forest">Artisan Reply:</span>{' '}
                      {enq.seller_response}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-sm font-semibold text-ink">
                  {formatCurrency(enq.product_price)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <div>
          <h2 className="font-serif text-lg font-semibold text-ink">Recently Viewed Crafts</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentlyViewed.map((item) => (
              <Link
                key={item.id}
                to={`/products/${item.id}`}
                className="card-surface overflow-hidden hover:shadow-md"
              >
                <img
                  src={resolveImageUrl(item.image)}
                  alt={item.name}
                  className="h-32 w-full object-cover"
                />
                <div className="p-3.5">
                  <p className="line-clamp-1 font-serif text-sm font-semibold text-ink">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-terracotta">
                    {formatCurrency(item.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}