import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { formatCurrency, resolveImageUrl } from '../../../utils/formatters';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  const handleMoveToCart = async (productId) => {
    const res = await addToCart(productId, 1);
    if (res) {
      await toggleWishlist(productId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Curated Favourites
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">
            Saved Wishlist ({wishlist.length})
          </h1>
        </div>
        <Link to="/shop" className="btn-secondary">
          Continue Exploring
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <div className="card-surface px-6 py-14 text-center">
          <Heart className="mx-auto h-8 w-8 text-ink-muted" />
          <h2 className="mt-3 font-serif text-lg font-semibold text-ink">
            Your wishlist is empty
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Tap the heart icon on any handcrafted product to save it here for later.
          </p>
          <Link to="/shop" className="btn-primary mt-5">
            Discover Crafts
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((entry) => {
            const product = entry.product_detail;
            if (!product) return null;
            const inStock = product.is_available && (product.stock_quantity ?? 1) > 0;

            return (
              <div key={entry.id} className="card-surface flex flex-col overflow-hidden">
                <Link to={`/products/${product.id}`} className="aspect-[4/3] overflow-hidden bg-ivory-dark">
                  <img
                    src={resolveImageUrl(product.image)}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs text-ink-muted">{product.brand_name}</p>
                  <Link
                    to={`/products/${product.id}`}
                    className="mt-1 font-serif text-base font-semibold text-ink hover:text-terracotta"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-2 font-serif text-lg font-semibold text-terracotta">
                    {formatCurrency(product.price)}
                  </p>

                  <div className="mt-auto flex gap-2 pt-4">
                    <button
                      type="button"
                      disabled={!inStock}
                      onClick={() => handleMoveToCart(product.id)}
                      className="btn-primary flex-1 py-2 text-xs"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      {inStock ? 'Move to Cart' : 'Out of Stock'}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      className="btn-secondary px-3 py-2 text-xs text-red-700 hover:border-red-300"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}