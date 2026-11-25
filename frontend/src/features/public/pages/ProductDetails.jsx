import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, User, Calendar, Send } from 'lucide-react';
import { productApi } from '../../../api/productApi';
import { buyerApi } from '../../../api/buyerApi';
import { useAuth } from '../../../context/AuthContext';
import {
  extractApiError,
  formatCurrency,
  formatDate,
  resolveImageUrl,
} from '../../../utils/formatters';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';

export default function ProductDetails() {
  const { id } = useParams();
  const { isAuthenticated, isBuyer } = useAuth();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState('');
  const [enquiryError, setEnquiryError] = useState('');

  useEffect(() => {
    setLoading(true);
    productApi
      .getProductById(id)
      .then((res) => {
        setProduct(res.data);
        setActiveImage(resolveImageUrl(res.data.image));
        // Save to recently viewed in localStorage for Buyer Dashboard
        const recentKey = 'varnika_recently_viewed';
        const existing = JSON.parse(localStorage.getItem(recentKey) || '[]');
        const filtered = existing.filter((item) => item.id !== res.data.id);
        const updated = [
          {
            id: res.data.id,
            name: res.data.name,
            price: res.data.price,
            image: res.data.image,
            location: res.data.location,
          },
          ...filtered,
        ].slice(0, 4);
        localStorage.setItem(recentKey, JSON.stringify(updated));
      })
      .catch((err) => {
        setError(extractApiError(err, 'Unable to load product details.').message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setEnquiryError('');
    setEnquirySuccess('');

    if (message.trim().length < 10) {
      setEnquiryError('Please write at least 10 characters explaining your enquiry.');
      return;
    }

    setSubmitting(true);
    try {
      await buyerApi.createEnquiry({
        product: product.id,
        message: message.trim(),
      });
      setMessage('');
      setEnquirySuccess(
        'Your enquiry has been sent to the artisan. Track its status in your Buyer Dashboard.'
      );
    } catch (err) {
      const parsed = extractApiError(err, 'Could not submit enquiry.');
      setEnquiryError(parsed.fieldErrors.message || parsed.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading text="Loading craft details..." />;
  if (error || !product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <ErrorMessage message={error || 'Product not found.'} />
      </div>
    );
  }

  const allImages = [
    resolveImageUrl(product.image),
    ...(product.additional_images || []).map((img) => resolveImageUrl(img.image)),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Catalog
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Image Gallery */}
        <div className="space-y-4 lg:col-span-6">
          <div className="card-surface aspect-[4/3] overflow-hidden bg-ivory-dark">
            <img
              src={activeImage}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          {allImages.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={`${imgUrl}-${idx}`}
                  type="button"
                  onClick={() => setActiveImage(imgUrl)}
                  className={`h-20 w-20 overflow-hidden rounded-md border-2 ${
                    activeImage === imgUrl ? 'border-terracotta' : 'border-ivory-border'
                  }`}
                >
                  <img src={imgUrl} alt={`View ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product & Seller Details + Enquiry Form */}
        <div className="space-y-6 lg:col-span-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded bg-ivory-dark px-2.5 py-1 text-xs font-semibold text-forest">
                {product.category_display}
              </span>
              <span
                className={`rounded px-2.5 py-1 text-xs font-semibold ${
                  product.is_available
                    ? 'bg-forest-light text-forest'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {product.is_available ? 'Available for Enquiry' : 'Currently Unavailable'}
              </span>
            </div>

            <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">{product.name}</h1>
            <p className="mt-2 font-serif text-2xl font-semibold text-terracotta">
              {formatCurrency(product.price)}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                Crafted in {product.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Listed {formatDate(product.created_at)}
              </span>
            </div>
          </div>

          <div className="border-t border-ivory-border pt-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
              Description &amp; Craftsmanship
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">
              {product.description}
            </p>
          </div>

          {/* Artisan Profile Card */}
          <div className="card-surface p-5">
            <div className="flex items-start gap-3.5">
              <span className="rounded-md bg-terracotta-light p-2.5 text-terracotta">
                <User className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Artisan Maker
                </p>
                <h3 className="mt-0.5 font-serif text-lg font-semibold text-ink">
                  {product.seller.full_name}
                </h3>
                <p className="text-xs text-ink-muted">
                  {product.seller.location}
                  {product.seller.craft_specialty ? ` • ${product.seller.craft_specialty}` : ''}
                </p>
                {product.seller.bio && (
                  <p className="mt-2 text-sm text-ink-muted">{product.seller.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Direct Enquiry Section */}
          <div className="card-surface p-6">
            <h2 className="font-serif text-lg font-semibold text-ink">
              Contact Artisan About This Piece
            </h2>

            {!product.is_available ? (
              <p className="mt-2 text-sm text-ink-muted">
                This craft item is currently marked unavailable by the artisan.
              </p>
            ) : !isAuthenticated ? (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-ink-muted">
                  Sign in with a buyer account to send a direct purchase or customization enquiry to{' '}
                  <span className="font-semibold text-ink">{product.seller.full_name}</span>.
                </p>
                <div className="flex gap-3">
                  <Link to="/login" className="btn-primary">
                    Sign In to Enquire
                  </Link>
                  <Link to="/register?role=buyer" className="btn-secondary">
                    Create Buyer Account
                  </Link>
                </div>
              </div>
            ) : !isBuyer ? (
              <p className="mt-2 text-sm text-ink-muted">
                You are signed in as a seller. Switch to a buyer account to submit product enquiries.
              </p>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="mt-4 space-y-4">
                <ErrorMessage message={enquiryError} />
                {enquirySuccess && (
                  <div className="rounded-md border border-[#BFD6C9] bg-forest-light px-4 py-3 text-sm font-medium text-forest">
                    {enquirySuccess}{' '}
                    <Link to="/buyer/enquiries" className="underline">
                      View My Enquiries
                    </Link>
                  </div>
                )}

                <div>
                  <label htmlFor="enquiry_message" className="block text-sm font-medium text-ink">
                    Your Message to {product.seller.full_name}
                  </label>
                  <textarea
                    id="enquiry_message"
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about availability, delivery location, custom sizing, or quantity..."
                    className="input-field mt-1"
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn-primary">
                  <Send className="h-4 w-4" />
                  {submitting ? 'Sending Enquiry...' : 'Send Enquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}