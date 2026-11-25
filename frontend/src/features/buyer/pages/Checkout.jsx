import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin, ShieldCheck, CreditCard } from 'lucide-react';
import { orderApi } from '../../../api/orderApi';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import { extractApiError, formatCurrency, resolveImageUrl } from '../../../utils/formatters';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';

export default function Checkout() {
  const { user } = useAuth();
  const { cart, refreshStore, showToast } = useStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  const [newAddress, setNewAddress] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    house_building: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    save_address: true,
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay_test');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [gatewayOrderId, setGatewayOrderId] = useState('');

  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    orderApi
      .getAddresses()
      .then((res) => {
        const list = res.data || [];
        setAddresses(list);
        if (list.length > 0) {
          const def = list.find((a) => a.is_default) || list[0];
          setSelectedAddressId(def.id);
          setUseNewAddress(false);
        } else {
          setUseNewAddress(true);
        }
      })
      .catch(() => setUseNewAddress(true))
      .finally(() => setLoadingAddresses(false));
  }, []);

  if (loadingAddresses) return <Loading text="Preparing checkout..." />;

  const items = cart.items || [];
  if (items.length === 0 && !createdOrder) {
    return (
      <div className="card-surface px-6 py-14 text-center">
        <h1 className="font-serif text-2xl font-semibold text-ink">Your Cart is Empty</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Add handcrafted items to your cart before proceeding to checkout.
        </p>
        <Link to="/shop" className="btn-primary mt-5">
          Explore the Shop
        </Link>
      </div>
    );
  }

  const handleProceedToReview = (e) => {
    e.preventDefault();
    setError('');
    if (!useNewAddress && !selectedAddressId) {
      setError('Please select a delivery address or enter a new one.');
      return;
    }
    if (useNewAddress) {
      const req = ['full_name', 'phone', 'house_building', 'street', 'city', 'state', 'pincode'];
      const missing = req.filter((k) => !newAddress[k]?.trim());
      if (missing.length > 0) {
        setError('Please fill in all required delivery address fields.');
        return;
      }
    }
    setStep(2);
  };

  const handleCreateOrder = async () => {
    setError('');
    setProcessing(true);
    try {
      const payload = useNewAddress
        ? { ...newAddress, payment_method: paymentMethod }
        : { address_id: selectedAddressId, payment_method: paymentMethod };

      const res = await orderApi.checkout(payload);
      const orderObj = res.data.order;
      setCreatedOrder(orderObj);
      setGatewayOrderId(orderObj.payment?.gateway_order_id || '');
      await refreshStore();
      setStep(3);
    } catch (err) {
      setError(extractApiError(err, 'Could not place order. Please verify stock and address.').message);
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmTestPayment = async () => {
    if (!createdOrder) return;
    setError('');
    setProcessing(true);
    try {
      const res = await orderApi.verifyPayment(createdOrder.order_number, {
        test_mode_confirm: true,
      });
      showToast('Test-mode payment verified and order confirmed!');
      navigate(`/buyer/orders/${res.data.order_number}`, { replace: true });
    } catch (err) {
      setError(extractApiError(err, 'Payment verification failed.').message);
    } finally {
      setProcessing(false);
    }
  };

  const selectedAddressObj = addresses.find((a) => a.id === selectedAddressId);

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/buyer/cart"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Checkout
        </h1>
      </div>

      {/* Stepper Indicator */}
      <div className="grid grid-cols-3 gap-2 rounded-lg border border-ivory-border bg-white p-3 text-xs font-semibold">
        <div className={`rounded px-3 py-2 text-center ${step >= 1 ? 'bg-forest text-white' : 'text-ink-muted'}`}>
          1. Delivery Address
        </div>
        <div className={`rounded px-3 py-2 text-center ${step >= 2 ? 'bg-forest text-white' : 'text-ink-muted'}`}>
          2. Order Review
        </div>
        <div className={`rounded px-3 py-2 text-center ${step >= 3 ? 'bg-forest text-white' : 'text-ink-muted'}`}>
          3. Payment Verification
        </div>
      </div>

      <ErrorMessage message={error} />

      {/* STEP 1: DELIVERY ADDRESS */}
      {step === 1 && (
        <form onSubmit={handleProceedToReview} className="card-surface space-y-6 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-ink">
              <MapPin className="h-5 w-5 text-terracotta" />
              Select or Enter Delivery Address
            </h2>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={() => setUseNewAddress((v) => !v)}
                className="text-xs font-semibold text-forest hover:underline"
              >
                {useNewAddress ? 'Use a Saved Address' : '+ Enter New Address'}
              </button>
            )}
          </div>

          {!useNewAddress && addresses.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`cursor-pointer rounded-md border p-4 transition-colors ${
                    selectedAddressId === addr.id
                      ? 'border-forest bg-forest-light/40'
                      : 'border-ivory-border bg-white hover:border-ink-muted'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="saved_addr"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 text-forest"
                    />
                    <div className="text-sm">
                      <p className="font-semibold text-ink">{addr.full_name}</p>
                      <p className="text-xs text-ink-muted">{addr.phone}</p>
                      <p className="mt-1.5 text-ink">
                        {addr.house_building}, {addr.street}, {addr.city}, {addr.state} -{' '}
                        {addr.pincode}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newAddress.full_name}
                  onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">House / Building *</label>
                <input
                  type="text"
                  required
                  value={newAddress.house_building}
                  onChange={(e) => setNewAddress({ ...newAddress, house_building: e.target.value })}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">Street / Locality *</label>
                <input
                  type="text"
                  required
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">City *</label>
                <input
                  type="text"
                  required
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">State *</label>
                <input
                  type="text"
                  required
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">PIN Code *</label>
                <input
                  type="text"
                  required
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">Country *</label>
                <input
                  type="text"
                  required
                  value={newAddress.country}
                  onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                  className="input-field mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={newAddress.save_address}
                    onChange={(e) => setNewAddress({ ...newAddress, save_address: e.target.checked })}
                    className="h-4 w-4 rounded border-ivory-border text-forest"
                  />
                  Save this address to my account for future orders
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-end border-t border-ivory-border pt-4">
            <button type="submit" className="btn-primary px-8">
              Continue to Order Review
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: ORDER REVIEW */}
      {step === 2 && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="card-surface p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold text-ink">Delivering To</h2>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-terracotta hover:underline"
                >
                  Change Address
                </button>
              </div>
              {useNewAddress ? (
                <p className="mt-2 text-sm text-ink">
                  <strong>{newAddress.full_name}</strong> ({newAddress.phone}) &mdash;{' '}
                  {newAddress.house_building}, {newAddress.street}, {newAddress.city},{' '}
                  {newAddress.state} - {newAddress.pincode}
                </p>
              ) : (
                selectedAddressObj && (
                  <p className="mt-2 text-sm text-ink">
                    <strong>{selectedAddressObj.full_name}</strong> ({selectedAddressObj.phone}) &mdash;{' '}
                    {selectedAddressObj.house_building}, {selectedAddressObj.street},{' '}
                    {selectedAddressObj.city}, {selectedAddressObj.state} -{' '}
                    {selectedAddressObj.pincode}
                  </p>
                )
              )}
            </div>

            <div className="card-surface divide-y divide-ivory-border p-6">
              <h2 className="pb-3 font-serif text-lg font-semibold text-ink">
                Items in Order ({cart.total_items})
              </h2>
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={resolveImageUrl(item.product_detail?.image)}
                      alt={item.product_detail?.name}
                      className="h-14 w-14 rounded border border-ivory-border object-cover"
                    />
                    <div>
                      <p className="font-serif text-sm font-semibold text-ink">
                        {item.product_detail?.name}
                      </p>
                      <p className="text-xs text-ink-muted">
                        Studio: {item.product_detail?.brand_name} &middot; Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-ink">{formatCurrency(item.line_total)}</p>
                </div>
              ))}
            </div>

            <div className="card-surface space-y-3 p-6">
              <h2 className="font-serif text-lg font-semibold text-ink">Select Payment Mode</h2>
              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-forest bg-forest-light/40 p-4">
                <input
                  type="radio"
                  name="pay_method"
                  checked={paymentMethod === 'razorpay_test'}
                  onChange={() => setPaymentMethod('razorpay_test')}
                  className="mt-1 text-forest"
                />
                <div className="text-sm">
                  <p className="font-semibold text-ink">
                    Razorpay Online Payment (Test Mode Sandbox)
                  </p>
                  <p className="text-xs text-ink-muted">
                    Creates a secure backend payment order and verifies payment status server-side.
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-ivory-border bg-white p-4">
                <input
                  type="radio"
                  name="pay_method"
                  checked={paymentMethod === 'cod_pending'}
                  onChange={() => setPaymentMethod('cod_pending')}
                  className="mt-1 text-forest"
                />
                <div className="text-sm">
                  <p className="font-semibold text-ink">Pay on Delivery (Payment Pending)</p>
                  <p className="text-xs text-ink-muted">
                    Order is recorded in PostgreSQL with payment marked pending until delivery.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="card-surface space-y-4 p-6">
              <h2 className="font-serif text-lg font-semibold text-ink">Price Breakdown</h2>
              <dl className="space-y-2 border-y border-ivory-border py-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Items Subtotal</dt>
                  <dd className="font-medium text-ink">{formatCurrency(cart.subtotal)}</dd>
                </div>
                {Number(cart.total_savings) > 0 && (
                  <div className="flex justify-between text-forest">
                    <dt>Offer Discount</dt>
                    <dd className="font-semibold">-{formatCurrency(cart.total_savings)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Shipping</dt>
                  <dd className="font-medium text-ink">
                    {Number(cart.shipping_charge) === 0
                      ? 'FREE'
                      : formatCurrency(cart.shipping_charge)}
                  </dd>
                </div>
              </dl>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-ink">Final Payable</span>
                <span className="font-serif text-2xl font-semibold text-terracotta">
                  {formatCurrency(cart.total_amount)}
                </span>
              </div>

              <button
                type="button"
                disabled={processing}
                onClick={handleCreateOrder}
                className="btn-primary w-full py-3"
              >
                {processing ? 'Creating Order...' : 'Place Order & Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: BACKEND PAYMENT VERIFICATION */}
      {step === 3 && createdOrder && (
        <div className="card-surface mx-auto max-w-xl space-y-6 p-8 text-center">
          <span className="mx-auto inline-flex rounded-full bg-forest-light p-3 text-forest">
            <CreditCard className="h-7 w-7" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
              Order {createdOrder.order_number} Created
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">
              Complete Test-Mode Payment Verification
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Your order has been persisted in PostgreSQL and inventory has been reserved. Gateway
              Reference: <span className="font-mono font-semibold text-ink">{gatewayOrderId}</span>
            </p>
          </div>

          <div className="rounded-md border border-[#E4D2A8] bg-gold-light/70 p-4 text-left text-xs text-[#876423]">
            <p className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              Test-Mode Sandbox Notice
            </p>
            <p className="mt-1 leading-relaxed">
              No real money is charged. Clicking below calls{' '}
              <code>/api/orders/{createdOrder.order_number}/verify-payment/</code> to verify the
              transaction server-side and notify the artisan studios.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            {createdOrder.payment_method === 'razorpay_test' ? (
              <button
                type="button"
                disabled={processing}
                onClick={handleConfirmTestPayment}
                className="btn-forest px-6 py-3"
              >
                <CheckCircle2 className="h-4 w-4" />
                {processing
                  ? 'Verifying Payment...'
                  : `Verify Test Payment (${formatCurrency(createdOrder.total_amount)})`}
              </button>
            ) : (
              <Link
                to={`/buyer/orders/${createdOrder.order_number}`}
                className="btn-primary px-6 py-3"
              >
                View Order (Payment Pending)
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}