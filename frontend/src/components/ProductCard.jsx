import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, BadgeCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { formatCurrency, resolveImageUrl } from '../utils/formatters';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { isAuthenticated, isBuyer } = useAuth();
  const { isWishlisted, toggleWishlist, addToCart } = useStore();

  const wishlisted = isWishlisted(product.id);
  const inStock = product.is_available && (product.stock_quantity ?? 1) > 0;

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || !isBuyer) {
      navigate('/login');
      return;
    }
    await toggleWishlist(product.id);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    if (!isAuthenticated || !isBuyer) {
      navigate('/login');
      return;
    }
    await addToCart(product.id, 1);
  };

  return (
    <div className="card-surface group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link to={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-ivory-dark">
        <img
          src={resolveImageUrl(product.image)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {/* Discount or Out-of-Stock Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.has_active_offer && product.discount_percentage > 0 && (
            <span className="rounded bg-terracotta px-2 py-0.5 text-xs font-semibold text-white">
              {product.discount_percentage}% OFF
            </span>
          )}
          {!inStock && (
            <span className="rounded bg-ink/85 px-2 py-0.5 text-xs font-semibold text-white">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          className="absolute top-3 right-3 rounded-full border border-ivory-border bg-white/95 p-2 text-ink shadow-sm transition-colors hover:border-terracotta hover:text-terracotta"
        >
          <Heart
            className={`h-4 w-4 ${wishlisted ? 'fill-terracotta text-terracotta' : ''}`}
          />
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-ink-muted">
          <span className="truncate">{product.category_display}</span>
          <span className="shrink-0">{product.location}</span>
        </div>

        <Link
          to={`/products/${product.id}`}
          className="mt-1.5 line-clamp-1 font-serif text-base font-semibold text-ink hover:text-terracotta"
        >
          {product.name}
        </Link>

        {/* Brand Link */}
        <div className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
          {product.brand_id ? (
            <Link
              to={`/brands/${product.brand_id}`}
              className="inline-flex items-center gap-1 font-medium text-forest hover:underline"
            >
              <span className="truncate">{product.brand_name}</span>
              {product.is_brand_verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-forest" />}
            </Link>
          ) : (
            <span className="truncate">By {product.brand_name}</span>
          )}
        </div>

        {/* Price & Actions */}
        <div className="mt-auto pt-4">
          <div className="flex items-baseline gap-2 border-t border-ivory-border pt-3">
            <span className="font-serif text-lg font-semibold text-ink">
              {formatCurrency(product.price)}
            </span>
            {product.has_active_offer && product.original_price && (
              <span className="text-xs text-ink-muted line-through">
                {formatCurrency(product.original_price)}
              </span>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <Link
              to={`/products/${product.id}`}
              className="btn-secondary flex-1 py-2 text-xs"
            >
              View Product
            </Link>
            <button
              type="button"
              disabled={!inStock}
              onClick={handleAddToCart}
              className="btn-primary flex-1 py-2 text-xs"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {inStock ? 'Add to Cart' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}