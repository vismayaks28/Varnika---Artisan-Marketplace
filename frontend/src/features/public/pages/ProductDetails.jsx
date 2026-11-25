import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Heart,
  MapPin,
  Minus,
  Plus,
  Send,
  ShoppingBag,
  Truck,
  Zap,
  ZoomIn,
} from 'lucide-react';
import { productApi } from '../../../api/productApi';
import { buyerApi } from '../../../api/buyerApi';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import {
  extractApiError,
  formatCurrency,
  resolveImageUrl,
} from '../../../utils/formatters';
import ProductCard from '../../../components/ProductCard';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isBuyer } = useAuth();
  const { isWishlisted, toggleWishlist, addToCart } = useStore();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [brandProducts, setBrandProducts] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [zoomOpen, setZoomOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Optional custom enquiry form state
  const [showEnquiryBox, setShowEnquiryBox] = useState(false);
  const [message, setMessage] = useState('');
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState('');
  const [enquiryError, setEnquiryError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setQuantity(1);
    setShowEnquiryBox(false);
    setEnquirySuccess('');
    setEnquiryError('');

    productApi
      .getProductById(id)
      .then((res) => {
        const prod = res.data;
        setProduct(prod);
        setActiveImage(resolveImageUrl(prod.image));

        // Fetch related products in same category
        productApi
          .getProducts({ category: prod.category })
          .then((catRes) => {
            const list = catRes.data.results || catRes.data || [];
            setRelatedProducts(list.filter((p) => p.id !== prod.id).slice(0, 4));
          })
          .catch(() => {});

        // Fetch other products from same brand
        if (prod.brand?.id) {
          productApi
            .getBrandById(prod.brand.id)
            .then((brandRes) => {
              const bList = brandRes.data.products || [];
              setBrandProducts(bList.filter((p) => p.id !== prod.id).slice(0, 4));
            })
            .catch(() => {});
        } else {
          setBrandProducts([]);
        }
      })
      .catch((err) => {
        setError(extractApiError(err, 'Unable to load product details.').message);
      })
      .finally(() => setLoading(false));
  }, [id]);

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

  const inStock = product.is_available && product.stock_quantity > 0;
  const maxQty = Math.max(1, product.stock_quantity || 1);
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = async () => {
    if (!inStock) return;
    if (!isAuthenticated || !isBuyer) {
      navigate('/login');
      return;
    }
    await addToCart(product.id, quantity);
  };

  const handleBuyNow = async () => {
    if (!inStock) return;
    if (!isAuthenticated || !isBuyer) {
      navigate('/login');
      return;
    }
    const res = await addToCart(product.id, quantity);
    if (res && !res.requiresAuth) {
      navigate('/buyer/checkout');
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated || !isBuyer) {
      navigate('/login');
      return;
    }
    await toggleWishlist(product.id);
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setEnquiryError('');
    setEnquirySuccess('');
    if (message.trim().length < 10) {
      setEnquiryError('Please write at least 10 characters explaining your customization or bulk enquiry.');
      return;
    }
    setSubmittingEnquiry(true);
    try {
      await buyerApi.createEnquiry({ product: product.id, message: message.trim() });
      setMessage('');
      setEnquirySuccess('Your custom enquiry has been sent to the artisan.');
    } catch (err) {
      setEnquiryError(extractApiError(err, 'Could not send enquiry.').message);
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  const specs = [
    { label: 'Material', value: product.material },
    { label: 'Craft Technique', value: product.craft_technique },
    { label: 'Dimensions', value: product.dimensions },
    { label: 'Weight', value: product.weight },
    { label: 'Color / Finish', value: product.color },
    { label: 'Origin Region', value: product.location },
    { label: 'SKU', value: product.sku },
    {
      label: 'Customization',
      value: product.is_customizable ? 'Available on request' : '',
    },
  ].filter((item) => Boolean(item.value));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/shop"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Shop
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left: Product Gallery */}
        <div className="space-y-4 lg:col-span-6">
          <div className="card-surface relative aspect-[4/3] overflow-hidden bg-ivory-dark">
            <img
              src={activeImage}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-md border border-ivory-border bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink shadow-sm hover:border-terracotta"
            >
              <ZoomIn className="h-3.5 w-3.5" />
              Enlarge
            </button>
          </div>

          {allImages.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={`${imgUrl}-${idx}`}
                  type="button"
                  onClick={() => setActiveImage(imgUrl)}
                  className={`h-20 w-20 overflow-hidden rounded-md border-2 transition-all ${
                    activeImage === imgUrl ? 'border-terracotta' : 'border-ivory-border opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Purchase Controls */}
        <div className="space-y-6 lg:col-span-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/shop?category=${product.category}`}
                className="rounded bg-ivory-dark px-2.5 py-1 text-xs font-semibold text-forest hover:underline"
              >
                {product.category_display}
              </Link>
              <span
                className={`rounded px-2.5 py-1 text-xs font-semibold ${
                  inStock ? 'bg-forest-light text-forest' : 'bg-red-50 text-red-800'
                }`}
              >
                {inStock ? `In Stock (${product.stock_quantity} available)` : 'Out of Stock'}
              </span>
              {product.has_active_offer && product.offer_label && (
                <span className="rounded bg-terracotta-light px-2.5 py-1 text-xs font-semibold text-terracotta">
                  {product.offer_label}
                </span>
              )}
            </div>

            <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">{product.name}</h1>

            {/* Brand Byline */}
            {product.brand && (
              <div className="mt-1.5 flex items-center gap-1.5 text-sm">
                <span className="text-ink-muted">Crafted by</span>
                {product.brand.id ? (
                  <Link
                    to={`/brands/${product.brand.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-forest hover:underline"
                  >
                    {product.brand.brand_name}
                    {product.brand.is_verified && <BadgeCheck className="h-4 w-4 text-forest" />}
                  </Link>
                ) : (
                  <span className="font-semibold text-ink">{product.brand.brand_name}</span>
                )}
              </div>
            )}

            {/* Price Block */}
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="font-serif text-3xl font-semibold text-terracotta">
                {formatCurrency(product.price)}
              </span>
              {product.has_active_offer && product.original_price && (
                <>
                  <span className="text-base text-ink-muted line-through">
                    {formatCurrency(product.original_price)}
                  </span>
                  <span className="rounded bg-terracotta px-2 py-0.5 text-xs font-semibold text-white">
                    Save {product.discount_percentage}%
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-ink-muted">Inclusive of all craft studio charges</p>

            {product.short_description && (
              <p className="mt-4 text-sm font-medium leading-relaxed text-ink">
                {product.short_description}
              </p>
            )}
          </div>

          {/* Quantity Selector + Purchase Actions */}
          <div className="card-surface space-y-4 p-5">
            {inStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Quantity:
                </span>
                <div className="inline-flex items-center rounded-md border border-ivory-border bg-ivory">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-ink hover:text-terracotta disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-ink">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                    className="p-2 text-ink hover:text-terracotta disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={!inStock}
                onClick={handleAddToCart}
                className="btn-secondary flex-1 py-3"
              >
                <ShoppingBag className="h-4 w-4" />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button
                type="button"
                disabled={!inStock}
                onClick={handleBuyNow}
                className="btn-primary flex-1 py-3"
              >
                <Zap className="h-4 w-4" />
                Buy Now
              </button>
              <button
                type="button"
                onClick={handleWishlist}
                className="btn-secondary px-4 py-3"
                title={wishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
              >
                <Heart
                  className={`h-4 w-4 ${wishlisted ? 'fill-terracotta text-terracotta' : ''}`}
                />
              </button>
            </div>

            {/* Shipping & Return Notes (Only shown if supplied) */}
            {(product.processing_time || product.shipping_info || product.return_policy) && (
              <div className="space-y-1.5 border-t border-ivory-border pt-3 text-xs text-ink-muted">
                {product.processing_time && (
                  <p className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-forest" />
                    <span>
                      <strong className="text-ink">Workshop Dispatch:</strong> {product.processing_time}
                    </span>
                  </p>
                )}
                {product.shipping_info && <p>{product.shipping_info}</p>}
                {product.return_policy && (
                  <p>
                    <strong className="text-ink">Returns:</strong> {product.return_policy}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Detailed Description */}
          <div className="border-t border-ivory-border pt-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              About This Handcrafted Piece
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">
              {product.description}
            </p>
          </div>

          {/* Specifications Table (Only supplied fields) */}
          {specs.length > 0 && (
            <div className="border-t border-ivory-border pt-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Craft Specifications
              </h2>
              <dl className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {specs.map((spec) => (
                  <div key={spec.label} className="rounded border border-ivory-border bg-white px-3.5 py-2.5">
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                      {spec.label}
                    </dt>
                    <dd className="mt-0.5 text-sm font-medium text-ink">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Care Instructions (Only if supplied) */}
          {product.care_instructions && (
            <div className="border-t border-ivory-border pt-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Care Instructions
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">
                {product.care_instructions}
              </p>
            </div>
          )}

          {/* Custom / Bulk Enquiry Option */}
          {isAuthenticated && isBuyer && (
            <div className="border-t border-ivory-border pt-4">
              <button
                type="button"
                onClick={() => setShowEnquiryBox((v) => !v)}
                className="text-xs font-semibold text-forest hover:underline"
              >
                {showEnquiryBox
                  ? 'Hide Custom Enquiry Form'
                  : 'Need customization or bulk quantity? Message the Artisan'}
              </button>

              {showEnquiryBox && (
                <form onSubmit={handleEnquirySubmit} className="card-surface mt-3 space-y-3 p-4">
                  <ErrorMessage message={enquiryError} />
                  {enquirySuccess && (
                    <p className="rounded bg-forest-light px-3 py-2 text-xs font-medium text-forest">
                      {enquirySuccess}
                    </p>
                  )}
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask the studio about custom dimensions, finishes, or bulk gifting..."
                    className="input-field text-xs"
                  />
                  <button type="submit" disabled={submittingEnquiry} className="btn-secondary py-2 text-xs">
                    <Send className="h-3.5 w-3.5" />
                    {submittingEnquiry ? 'Sending...' : 'Send Custom Enquiry'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Artisan / Brand Studio Section */}
      {product.brand && (
        <section className="card-surface mt-14 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              {product.brand.brand_logo ? (
                <img
                  src={resolveImageUrl(product.brand.brand_logo)}
                  alt={product.brand.brand_name}
                  className="h-16 w-16 shrink-0 rounded-lg border border-ivory-border object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-terracotta-light font-serif text-2xl font-bold text-terracotta">
                  {product.brand.brand_name?.[0]?.toUpperCase() || 'V'}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
                  About the Maker
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <h2 className="font-serif text-xl font-semibold text-ink">
                    {product.brand.brand_name}
                  </h2>
                  {product.brand.is_verified && (
                    <span className="inline-flex items-center gap-1 rounded bg-forest-light px-2 py-0.5 text-xs font-semibold text-forest">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified Brand
                    </span>
                  )}
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
                  <MapPin className="h-3.5 w-3.5" />
                  {product.brand.manufacturing_location}
                  {product.brand.craft_specialty ? ` • ${product.brand.craft_specialty}` : ''}
                </p>
                {product.brand.brand_description && (
                  <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-ink-muted">
                    {product.brand.brand_description}
                  </p>
                )}
              </div>
            </div>

            {product.brand.id && (
              <Link to={`/brands/${product.brand.id}`} className="btn-secondary shrink-0">
                Visit Brand Studio
              </Link>
            )}
          </div>

          {brandProducts.length > 0 && (
            <div className="mt-8 border-t border-ivory-border pt-6">
              <h3 className="font-serif text-lg font-semibold text-ink">
                More from {product.brand.brand_name}
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {brandProducts.map((item) => (
                  <ProductCard key={`brand-${item.id}`} product={item} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-14">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            Related Handcrafted Pieces
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={`rel-${item.id}`} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* Fullscreen Image Lightbox Modal */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomOpen(false)}
        >
          <div className="max-h-[90vh] max-w-4xl overflow-hidden rounded-lg bg-white p-2">
            <img
              src={activeImage}
              alt={product.name}
              className="max-h-[85vh] w-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
