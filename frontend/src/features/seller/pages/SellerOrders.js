import { useEffect, useState } from 'react';
import { sellerApi } from '../../../api/sellerApi';
import { useStore } from '../../../context/StoreContext';
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
  { value: '', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
];

const NEXT_ACTIONS = {
  pending: [
    { nextStatus: 'confirmed', label: 'Confirm Order', style: 'btn-forest' },
    { nextStatus: 'cancelled', label: 'Cancel Item', style: 'btn-danger' },
  ],
  confirmed: [
    { nextStatus: 'processing', label: 'Start Packing / Processing', style: 'btn-primary' },
  ],
  processing: [
    { nextStatus: 'shipped', label: 'Mark as Shipped', style: 'btn-forest' },
  ],
  shipped: [
    { nextStatus: 'delivered', label: 'Mark as Delivered', style: 'btn-primary' },
  ],
};

export default function SellerOrders() {
  const { showToast } = useStore();
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [notes, setNotes] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = () => {
    setLoading(true);
    setError('');
    sellerApi
      .getOrders(statusFilter)
      .then((res) => {
        setItems(res.data || []);
        const noteMap = {};
        (res.data || []).forEach((item) => {
          noteMap[item.id] = item.tracking_note || '';
        });
        setNotes(noteMap);
      })
      .catch((err) => setError(extractApiError(err, 'Failed to load studio orders.').message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleStatusChange = async (itemId, nextStatus) => {
    setUpdatingId(itemId);
    try {
      const res = await sellerApi.updateOrderItemStatus(itemId, {
        status: nextStatus,
        tracking_note: notes[itemId] || '',
      });
      setItems((prev) => prev.map((it) => (it.id === itemId ? res.data : it)));
      showToast(`Order item marked as ${nextStatus}.`);
    } catch (err) {
      showToast(extractApiError(err, 'Could not update order status.').message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
          Fulfillment Ledger
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Customer Orders
        </h1>
        <p className="mt-1 text-xs text-ink-muted">
          Showing only order items belonging to your studio.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-ivory-border pb-3">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors ${
              statusFilter === tab.value
                ? 'bg-terracotta text-white'
                : 'border border-ivory-border bg-white text-ink-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading text="Loading customer orders..." />
      ) : items.length === 0 ? (
        <div className="card-surface px-6 py-12 text-center">
          <p className="text-sm font-medium text-ink">No orders found in this status.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const actions = NEXT_ACTIONS[item.status] || [];
            return (
              <div key={item.id} className="card-surface space-y-4 p-5">
                <div className="flex flex-col justify-between gap-4 border-b border-ivory-border pb-4 sm:flex-row sm:items-start">
                  <div className="flex items-start gap-4">
                    <img
                      src={resolveImageUrl(item.product_image)}
                      alt={item.product_name}
                      className="h-16 w-16 shrink-0 rounded border border-ivory-border object-cover"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif text-base font-semibold text-ink">
                          {item.order_number}
                        </span>
                        <StatusBadge status={item.status} />
                        <span className="rounded bg-ivory-dark px-2 py-0.5 text-xs font-medium text-ink-muted capitalize">
                          Payment: {item.payment_status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-ink">
                        {item.product_name} &times; {item.quantity}
                      </p>
                      <p className="text-xs text-ink-muted">
                        Ordered on {formatDate(item.order_date)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-serif text-lg font-semibold text-forest">
                    {formatCurrency(item.line_total)}
                  </div>
                </div>

                {/* Delivery Address for Fulfillment */}
                <div className="rounded-md bg-ivory p-3.5 text-xs">
                  <p className="font-semibold text-ink">
                    Ship To: {item.buyer_name} ({item.buyer_phone})
                  </p>
                  <p className="mt-0.5 text-ink-muted">{item.shipping_address}</p>
                </div>

                {/* Tracking Note & Status Controls */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={notes[item.id] ?? ''}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder="Optional dispatch / courier tracking note for buyer..."
                    className="input-field flex-1 py-2 text-xs"
                  />

                  {actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {actions.map((act) => (
                        <button
                          key={act.nextStatus}
                          type="button"
                          disabled={updatingId === item.id}
                          onClick={() => handleStatusChange(item.id, act.nextStatus)}
                          className={`${act.style} py-2 text-xs`}
                        >
                          {updatingId === item.id ? 'Updating...' : act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}