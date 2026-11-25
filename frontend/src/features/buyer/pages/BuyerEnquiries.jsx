import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

const STATUS_TABS = [
  { value: '', label: 'All Enquiries' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

export default function BuyerEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    buyerApi
      .getEnquiries(statusFilter)
      .then((res) => setEnquiries(res.data))
      .catch((err) => setError(extractApiError(err, 'Failed to load your enquiries.').message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
          Enquiry History
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">
          My Product Enquiries
        </h1>
      </div>

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
        <Loading text="Loading your enquiries..." />
      ) : enquiries.length === 0 ? (
        <div className="card-surface px-6 py-12 text-center">
          <p className="text-sm font-medium text-ink">No enquiries found for this filter.</p>
          <Link to="/marketplace" className="btn-primary mt-4">
            Browse Handcrafted Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => (
            <div key={enq.id} className="card-surface p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="flex items-start gap-4">
                  <img
                    src={resolveImageUrl(enq.product_image)}
                    alt={enq.product_name}
                    className="h-16 w-16 shrink-0 rounded border border-ivory-border object-cover"
                  />
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
                      Artisan: <span className="font-semibold text-ink">{enq.seller_name}</span> (
                      {enq.seller_location}) &middot; Sent {formatDate(enq.created_at)}
                    </p>
                    {enq.seller_phone && (
                      <p className="mt-1 text-xs font-semibold text-forest">
                        Artisan Direct Contact: {enq.seller_phone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-sm font-semibold text-ink">
                  {formatCurrency(enq.product_price)}
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-ivory-border pt-3 text-sm">
                <p className="text-ink">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Your Message:{' '}
                  </span>
                  {enq.message}
                </p>
                {enq.seller_response && (
                  <div className="rounded-md border border-[#BFD6C9] bg-forest-light/60 p-3 text-ink">
                    <span className="text-xs font-semibold uppercase tracking-wider text-forest">
                      Artisan Response:{' '}
                    </span>
                    {enq.seller_response}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}