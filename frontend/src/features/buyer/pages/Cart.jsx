import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { formatCurrency, resolveImageUrl } from '../../../utils/formatters';

export default function Cart() {
  const { cart, updateCartQuantity, removeFromCart } = useStore();
  const items = cart.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Shopping Bag
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">
            Your Cart ({cart.total_items || 0} item{cart.total_items === 1 ? '' : 's'})
          </h1>
        </div>
        <Link to="/shop" className="btn-secondary">
          Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="card-surface px-6 py-14 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-ink-muted" />
          <h2 className="mt-3 font-serif text-lg font-semibold text-ink">
            Your shopping cart is empty
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Explore authentic handmade pieces from verified Indian artisan studios.
          </p>
          <Link to="/shop" className="btn-primary mt-5">
            Browse Handcrafted Works
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Cart Items List */}
          <div className="space-y-4 lg:col-span-8">
            {items.map((item) => {
              const prod = item.product_detail;
              if (!prod) return null;

              return (
                <div
                  key={item.id}
                  className="card-surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                >
                  <Link
                    to={`/products/${prod.id}`}
                    className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-ivory-border bg-ivory-dark"
                  >
                    <img
                      src={resolveImageUrl(prod.image)}
                      alt={prod.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/products/${prod.id}`}
                      className="font-serif text-base font-semibold text-ink hover:text-terracotta"
                    >
                      {prod.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      Studio: <span className="font-medium text-forest">{prod.brand_name}</span>
                    </p>
                    <p className="mt-1 text-sm font-semibold text-ink">
                      {formatCurrency(prod.price)}{' '}
                      <span className="text-xs font-normal text-ink-muted">each</span>
                    </p>
                  </div>

                  {/* Quantity & Line Total */}
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="inline-flex items-center rounded-md border border-ivory-border bg-ivory">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="p-2 text-ink hover:text-terracotta"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-ink">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={item.quantity >= (prod.stock_quantity || 1)}
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="p-2 text-ink hover:text-terracotta disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="w-24 text-right font-serif text-base font-semibold text-ink">
                      {formatCurrency(item.line_total)}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="rounded p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-700"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-4">
            <div className="card-surface space-y-4 p-6">
              <h2 className="font-serif text-lg font-semibold text-ink">Order Summary</h2>

              <dl className="space-y-2.5 border-y border-ivory-border py-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Subtotal</dt>
                  <dd className="font-medium text-ink">{formatCurrency(cart.subtotal)}</dd>
                </div>

                {Number(cart.total_savings) > 0 && (
                  <div className="flex justify-between text-forest">
                    <dt>Artisan Offer Savings</dt>
                    <dd className="font-semibold">-{formatCurrency(cart.total_savings)}</dd>
                  </div>
                )}

                <div className="flex justify-between">
                  <dt className="text-ink-muted">Shipping</dt>
                  <dd className="font-medium text-ink">
                    {Number(cart.shipping_charge) === 0 ? (
                      <span className="font-semibold text-forest">FREE</span>
                    ) : (
                      formatCurrency(cart.shipping_charge)
                    )}
                  </dd>
                </div>
              </dl>

              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-ink">Total Payable</span>
                <span className="font-serif text-2xl font-semibold text-terracotta">
                  {formatCurrency(cart.total_amount)}
                </span>
              </div>

              {Number(cart.shipping_charge) > 0 && (
                <p className="text-xs text-ink-muted">
                  Add {formatCurrency(2000 - Number(cart.subtotal))} more for complimentary shipping across India.
                </p>
              )}

              <Link to="/buyer/checkout" className="btn-primary w-full py-3">
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}