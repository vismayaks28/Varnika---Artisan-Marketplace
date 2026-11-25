import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { orderApi } from '../../../api/orderApi';
import { extractApiError, formatCurrency, formatDate, resolveImageUrl } from '../../../utils/formatters';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import StatusBadge from '../../../components/StatusBadge';

export default function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orderApi
      .getOrders()
      .then((res) => setOrders(res.data || []))
      .catch((err) => setError(extractApiError(err, 'Failed to load your order history.').message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Loading your order history..." />;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
          Purchase History
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">
          My Orders ({orders.length})
        </h1>
      </div>

      <ErrorMessage message={error} />

      {orders.length === 0 ? (
        <div className="card-surface px-6 py-14 text-center">
          <Package className="mx-auto h-8 w-8 text-ink-muted" />
          <h2 className="mt-3 font-serif text-lg font-semibold text-ink">No orders placed yet</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Once you place an order, you can track studio fulfillment and delivery updates here.
          </p>
          <Link to="/shop" className="btn-primary mt-5">
            Explore the Shop
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card-surface p-5">
              <div className="flex flex-col justify-between gap-3 border-b border-ivory-border pb-4 sm:flex-row sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-serif text-lg font-semibold text-ink">
                      {order.order_number}
                    </span>
                    <StatusBadge status={order.status} />
                    <span className="rounded bg-ivory-dark px-2.5 py-0.5 text-xs font-medium text-ink-muted capitalize">
                      Payment: {order.payment_status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    Placed on {formatDate(order.created_at)} &middot; Ship to{' '}
                    {order.shipping_city}, {order.shipping_state}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-serif text-lg font-semibold text-terracotta">
                    {formatCurrency(order.total_amount)}
                  </span>
                  <Link
                    to={`/buyer/orders/${order.order_number}`}
                    className="btn-secondary py-1.5 text-xs"
                  >
                    Order Details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-md border border-ivory-border bg-ivory/60 px-3 py-2 text-xs"
                  >
                    <img
                      src={resolveImageUrl(item.product_image)}
                      alt={item.product_name}
                      className="h-10 w-10 rounded object-cover"
                    />
                    <div>
                      <p className="font-semibold text-ink">{item.product_name}</p>
                      <p className="text-ink-muted">
                        Qty: {item.quantity} &middot; Studio status:{' '}
                        <span className="font-semibold capitalize text-forest">{item.status}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}