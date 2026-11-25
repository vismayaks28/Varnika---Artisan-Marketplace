import { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { orderApi } from '../../../api/orderApi';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import { extractApiError } from '../../../utils/formatters';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';

export default function SavedAddresses() {
  const { user } = useAuth();
  const { showToast } = useStore();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    house_building: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    is_default: false,
  });

  const loadAddresses = () => {
    setLoading(true);
    orderApi
      .getAddresses()
      .then((res) => setAddresses(res.data || []))
      .catch((err) => setError(extractApiError(err, 'Failed to load addresses.').message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await orderApi.createAddress(form);
      showToast('Delivery address saved.');
      setShowForm(false);
      setForm({
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        house_building: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        is_default: false,
      });
      loadAddresses();
    } catch (err) {
      setError(extractApiError(err, 'Could not save address.').message);
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await orderApi.updateAddress(id, { is_default: true });
      showToast('Default delivery address updated.');
      loadAddresses();
    } catch (err) {
      setError(extractApiError(err, 'Could not update default address.').message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await orderApi.deleteAddress(id);
      showToast('Address removed.');
      loadAddresses();
    } catch (err) {
      setError(extractApiError(err, 'Could not delete address.').message);
    }
  };

  if (loading) return <Loading text="Loading saved addresses..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Delivery Book
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">
            Saved Addresses
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Add New Address'}
        </button>
      </div>

      <ErrorMessage message={error} />

      {showForm && (
        <form onSubmit={handleCreate} className="card-surface space-y-4 p-6">
          <h2 className="font-serif text-lg font-semibold text-ink">New Delivery Address</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-ink">Full Name</label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">Phone Number</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">House / Flat / Building</label>
              <input
                type="text"
                required
                value={form.house_building}
                onChange={(e) => setForm({ ...form, house_building: e.target.value })}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">Street / Locality</label>
              <input
                type="text"
                required
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">City</label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">State</label>
              <input
                type="text"
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">PIN Code</label>
              <input
                type="text"
                required
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">Country</label>
              <input
                type="text"
                required
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="input-field mt-1"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              className="h-4 w-4 rounded border-ivory-border text-forest"
            />
            Set as default shipping address
          </label>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="card-surface px-6 py-12 text-center">
          <MapPin className="mx-auto h-8 w-8 text-ink-muted" />
          <p className="mt-2 text-sm font-medium text-ink">No saved delivery addresses yet.</p>
          <p className="mt-1 text-xs text-ink-muted">
            Add an address above for faster checkout.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="card-surface flex flex-col justify-between p-5">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-semibold text-ink">{addr.full_name}</h3>
                  {addr.is_default && (
                    <span className="inline-flex items-center gap-1 rounded bg-forest-light px-2 py-0.5 text-xs font-semibold text-forest">
                      <CheckCircle2 className="h-3 w-3" />
                      Default
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-ink-muted">{addr.phone}</p>
                <p className="mt-2.5 text-sm leading-relaxed text-ink">
                  {addr.house_building}, {addr.street}, {addr.city}, {addr.state} - {addr.pincode},{' '}
                  {addr.country}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-ivory-border pt-3">
                {!addr.is_default ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-semibold text-forest hover:underline"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}