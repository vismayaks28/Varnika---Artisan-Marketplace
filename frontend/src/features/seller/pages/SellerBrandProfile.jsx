import { useEffect, useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { sellerApi } from '../../../api/sellerApi';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import { extractApiError, resolveImageUrl } from '../../../utils/formatters';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';

export default function SellerBrandProfile() {
  const { refreshUser } = useAuth();
  const { showToast } = useStore();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    brand_name: '',
    brand_description: '',
    craft_specialty: '',
    manufacturing_location: '',
    workshop_address: '',
    years_of_experience: '',
    website_or_social: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    sellerApi
      .getBrandProfile()
      .then((res) => {
        const p = res.data;
        setProfile(p);
        setForm({
          brand_name: p.brand_name || '',
          brand_description: p.brand_description || '',
          craft_specialty: p.craft_specialty || '',
          manufacturing_location: p.manufacturing_location || '',
          workshop_address: p.workshop_address || '',
          years_of_experience: p.years_of_experience ?? '',
          website_or_social: p.website_or_social || '',
        });
      })
      .catch((err) => setError(extractApiError(err, 'Failed to load brand profile.').message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null) payload.append(k, v);
      });
      if (logoFile) payload.append('brand_logo', logoFile);

      const res = await sellerApi.updateBrandProfile(payload, true);
      setProfile(res.data);
      setLogoFile(null);
      await refreshUser();
      showToast('Public brand profile updated.');
    } catch (err) {
      setError(extractApiError(err, 'Could not update brand profile.').message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading text="Loading brand profile..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Public Storefront Identity
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">
            Brand &amp; Studio Profile
          </h1>
        </div>
        {profile?.is_approved && (
          <span className="inline-flex items-center gap-1.5 rounded bg-forest-light px-3 py-1.5 text-xs font-semibold text-forest">
            <BadgeCheck className="h-4 w-4" />
            Verified Brand ({profile.verification_status})
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card-surface space-y-5 p-6 sm:p-8">
        <ErrorMessage message={error} />

        <div className="flex items-center gap-4">
          {profile?.brand_logo ? (
            <img
              src={resolveImageUrl(profile.brand_logo)}
              alt={profile.brand_name}
              className="h-20 w-20 rounded-lg border border-ivory-border object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-terracotta-light font-serif text-2xl font-bold text-terracotta">
              {form.brand_name?.[0]?.toUpperCase() || 'V'}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink">Update Brand Logo</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="mt-1 block text-xs text-ink-muted"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-ink">Brand Name *</label>
            <input
              type="text"
              required
              value={form.brand_name}
              onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
              className="input-field mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">Craft Specialty *</label>
            <input
              type="text"
              required
              value={form.craft_specialty}
              onChange={(e) => setForm({ ...form, craft_specialty: e.target.value })}
              className="input-field mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">Manufacturing Location *</label>
            <input
              type="text"
              required
              value={form.manufacturing_location}
              onChange={(e) => setForm({ ...form, manufacturing_location: e.target.value })}
              className="input-field mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">Years of Experience</label>
            <input
              type="number"
              min="0"
              value={form.years_of_experience}
              onChange={(e) => setForm({ ...form, years_of_experience: e.target.value })}
              className="input-field mt-1"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-ink">Workshop Address</label>
            <input
              type="text"
              value={form.workshop_address}
              onChange={(e) => setForm({ ...form, workshop_address: e.target.value })}
              className="input-field mt-1"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-ink">
              Artisan Story &amp; Brand Description *
            </label>
            <textarea
              rows={4}
              required
              value={form.brand_description}
              onChange={(e) => setForm({ ...form, brand_description: e.target.value })}
              className="input-field mt-1"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-ink">Website or Instagram Link</label>
            <input
              type="url"
              value={form.website_or_social}
              onChange={(e) => setForm({ ...form, website_or_social: e.target.value })}
              className="input-field mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Brand Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}