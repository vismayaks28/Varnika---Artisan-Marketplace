import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sellerApi } from '../../../api/sellerApi';
import { extractApiError, formatDate, resolveImageUrl } from '../../../utils/formatters';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import StatusBadge from '../../../components/StatusBadge';

const STATUS_TABS = [
  { value: '', label: 'All Enquiries' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

export default function SellerEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    sellerApi
      .getEnquiries(statusFilter)
      .then((res) => setEnquiries(res.data))
      .catch((err) => setError(extractApiError(err, 'Failed to load enquiries.').message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
          Buyer Communication
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Product Enquiries
        </h1>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-ivory-border pb-3">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors ${
              statusFilter === tab.value
                ? 'bg-forest text-white'
                : 'border border-ivory-border bg-white text-ink-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading text="Loading enquiries..." />
      ) : enquiries.length === 0 ? (
        <div className="card-surface px-6 py-12 text-center">
          <p className="text-sm font-medium text-ink">No enquiries match this filter.</p>
          <p className="mt-1 text-xs text-ink-muted">
            When buyers reach out regarding your products, their enquiries appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((enq) => (
            <div
              key={enq.id}
              className="card-surface flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-4">
                <img
                  src={resolveImageUrl(enq.product_image)}
                  alt={enq.product_name}
                  className="h-16 w-16 shrink-0 rounded border border-ivory-border object-cover"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-serif text-base font-semibold text-ink">
                      {enq.product_name}
                    </h2>
                    <StatusBadge status={enq.status} />
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    From <span className="font-semibold text-ink">{enq.buyer_name}</span> (
                    {enq.buyer_location}) &middot; {formatDate(enq.created_at)}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-ink">{enq.message}</p>
                </div>
              </div>

              <div className="shrink-0 sm:text-right">
                <Link to={`/seller/enquiries/${enq.id}`} className="btn-secondary">
                  View &amp; Respond
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}