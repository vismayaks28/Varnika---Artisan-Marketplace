import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, X, CheckCheck } from 'lucide-react';
import { sellerApi } from '../../../api/sellerApi';
import {
  extractApiError,
  formatCurrency,
  formatDate,
  resolveImageUrl,
} from '../../../utils/formatters';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import StatusBadge from '../../../components/StatusBadge';

export default function EnquiryDetails() {
  const { id } = useParams();
  const [enquiry, setEnquiry] = useState(null);
  const [sellerResponse, setSellerResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    sellerApi
      .getEnquiryById(id)
      .then((res) => {
        setEnquiry(res.data);
        setSellerResponse(res.data.seller_response || '');
      })
      .catch((err) => setError(extractApiError(err, 'Unable to load enquiry details.').message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    setError('');
    setSuccessMsg('');
    setUpdating(true);
    try {
      const res = await sellerApi.updateEnquiryStatus(id, {
        status: newStatus,
        seller_response: sellerResponse,
      });
      setEnquiry(res.data);
      setSuccessMsg(`Enquiry marked as ${newStatus}.`);
    } catch (err) {
      setError(extractApiError(err, 'Could not update enquiry status.').message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading text="Loading enquiry details..." />;
  if (!enquiry) return <ErrorMessage message={error || 'Enquiry not found.'} />;

  const isTerminal = enquiry.status === 'rejected' || enquiry.status === 'completed';

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/seller/enquiries"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Enquiries
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold text-ink">
            Enquiry #{enquiry.id}
          </h1>
          <StatusBadge status={enquiry.status} />
        </div>
        <p className="mt-1 text-xs text-ink-muted">Submitted on {formatDate(enquiry.created_at)}</p>
      </div>

      <ErrorMessage message={error} />
      {successMsg && (
        <div className="rounded-md border border-[#BFD6C9] bg-forest-light px-4 py-3 text-sm font-medium text-forest">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card-surface p-6">
            <h2 className="font-serif text-lg font-semibold text-ink">Buyer Message</h2>
            <p className="mt-3 whitespace-pre-line rounded-md border border-ivory-border bg-ivory p-4 text-sm leading-relaxed text-ink">
              {enquiry.message}
            </p>
          </div>

          <div className="card-surface p-6">
            <h2 className="font-serif text-lg font-semibold text-ink">
              Artisan Response &amp; Status
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              Include delivery timelines, customization notes, or payment instructions for the buyer.
            </p>

            <textarea
              rows={4}
              value={sellerResponse}
              onChange={(e) => setSellerResponse(e.target.value)}
              disabled={isTerminal || updating}
              placeholder="Write your reply to the buyer..."
              className="input-field mt-3"
            />

            {enquiry.status === 'pending' && (
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleStatusUpdate('accepted')}
                  className="btn-forest"
                >
                  <Check className="h-4 w-4" />
                  Accept Enquiry
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleStatusUpdate('rejected')}
                  className="btn-danger"
                >
                  <X className="h-4 w-4" />
                  Reject Enquiry
                </button>
              </div>
            )}

            {enquiry.status === 'accepted' && (
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleStatusUpdate('completed')}
                  className="btn-primary"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark as Completed
                </button>
              </div>
            )}

            {isTerminal && (
              <p className="mt-3 text-xs font-medium text-ink-muted">
                This enquiry is {enquiry.status} and cannot be modified further.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-surface p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Product Requested
            </h3>
            <img
              src={resolveImageUrl(enquiry.product_image)}
              alt={enquiry.product_name}
              className="mt-3 h-40 w-full rounded-md border border-ivory-border object-cover"
            />
            <p className="mt-3 font-serif text-base font-semibold text-ink">
              {enquiry.product_name}
            </p>
            <p className="mt-1 text-sm font-semibold text-terracotta">
              {formatCurrency(enquiry.product_price)}
            </p>
            <Link
              to={`/seller/products/${enquiry.product_id}/edit`}
              className="mt-3 inline-block text-xs font-semibold text-forest hover:underline"
            >
              View Product Listing
            </Link>
          </div>

          <div className="card-surface p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Buyer Details
            </h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div>
                <dt className="text-xs text-ink-muted">Name</dt>
                <dd className="font-medium text-ink">{enquiry.buyer_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Location</dt>
                <dd className="font-medium text-ink">{enquiry.buyer_location}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Email</dt>
                <dd className="font-medium text-ink">{enquiry.buyer_email}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Phone</dt>
                <dd className="font-medium text-ink">{enquiry.buyer_phone}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}