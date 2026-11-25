import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { extractApiError } from '../../utils/formatters';
import ErrorMessage from '../../components/ErrorMessage';

export default function SellerApply() {
  const { applySeller } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    brand_name: '',
    brand_description: '',
    craft_specialty: '',
    manufacturing_location: '',
    workshop_address: '',
    years_of_experience: '',
    website_or_social: '',
    additional_notes: '',
  });
  const [brandLogo, setBrandLogo] = useState(null);
  const [identityDoc, setIdentityDoc] = useState(null);
  const [workshopEvidence, setWorkshopEvidence] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!identityDoc) {
      setError('Please upload an identity or business verification document.');
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (val !== '' && val !== null) {
        payload.append(key, val);
      }
    });
    if (brandLogo) payload.append('brand_logo', brandLogo);
    payload.append('identity_document', identityDoc);
    if (workshopEvidence) payload.append('workshop_evidence', workshopEvidence);

    setSubmitting(true);
    try {
      await applySeller(payload);
      navigate('/seller/dashboard', { replace: true });
    } catch (err) {
      const parsed = extractApiError(err, 'Application submission failed. Please review your details.');
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="card-surface p-6 sm:p-10">
        <div className="border-b border-ivory-border pb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-forest">
            Artisan Verification &amp; Onboarding
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
            Apply to Become a Varnika Seller
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            To protect buyers and uphold craft authenticity, every studio application is manually
            reviewed before publishing access is granted.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <ErrorMessage message={error} />

          {/* Section 1: Personal & Account Details */}
          <section className="space-y-4">
            <h2 className="font-serif text-lg font-semibold text-ink">
              1. Personal &amp; Account Details
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink">First Name *</label>
                <input
                  name="first_name"
                  type="text"
                  required
                  value={form.first_name}
                  onChange={handleChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">Last Name *</label>
                <input
                  name="last_name"
                  type="text"
                  required
                  value={form.last_name}
                  onChange={handleChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">Email Address *</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="input-field mt-1"
                />
                {fieldErrors.email && <p className="mt-1 text-xs text-red-700">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">Phone Number *</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="input-field mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink">
                  Account Password (min 8 characters, letters &amp; numbers) *
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={handleChange}
                  className="input-field mt-1"
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-700">{fieldErrors.password}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink">Residential / Business Address *</label>
                <input
                  name="address"
                  type="text"
                  required
                  value={form.address}
                  onChange={handleChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">City *</label>
                <input
                  name="city"
                  type="text"
                  required
                  value={form.city}
                  onChange={handleChange}
                  className="input-field mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-ink">State *</label>
                  <input
                    name="state"
                    type="text"
                    required
                    value={form.state}
                    onChange={handleChange}
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink">PIN Code *</label>
                  <input
                    name="pincode"
                    type="text"
                    required
                    value={form.pincode}
                    onChange={handleChange}
                    className="input-field mt-1"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Public Brand & Workshop Profile */}
          <section className="space-y-4 border-t border-ivory-border pt-6">
            <h2 className="font-serif text-lg font-semibold text-ink">
              2. Brand &amp; Workshop Details
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink">Brand / Studio Name *</label>
                <input
                  name="brand_name"
                  type="text"
                  required
                  value={form.brand_name}
                  onChange={handleChange}
                  placeholder="e.g., Kumbhar Clay Studio"
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">Primary Craft Specialty *</label>
                <input
                  name="craft_specialty"
                  type="text"
                  required
                  value={form.craft_specialty}
                  onChange={handleChange}
                  placeholder="e.g., Blue Pottery, Handloom Weaving"
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">Manufacturing Location *</label>
                <input
                  name="manufacturing_location"
                  type="text"
                  required
                  value={form.manufacturing_location}
                  onChange={handleChange}
                  placeholder="e.g., Jaipur, Rajasthan"
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">Years of Experience</label>
                <input
                  name="years_of_experience"
                  type="number"
                  min="0"
                  value={form.years_of_experience}
                  onChange={handleChange}
                  className="input-field mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink">Workshop / Studio Address *</label>
                <input
                  name="workshop_address"
                  type="text"
                  required
                  value={form.workshop_address}
                  onChange={handleChange}
                  className="input-field mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink">
                  Brand Story &amp; Craft Description *
                </label>
                <textarea
                  name="brand_description"
                  rows={3}
                  required
                  value={form.brand_description}
                  onChange={handleChange}
                  placeholder="Describe your craft heritage, materials, and studio team..."
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">Brand Logo (JPEG/PNG/WebP)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setBrandLogo(e.target.files?.[0] || null)}
                  className="mt-1 block w-full text-xs text-ink-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">Website or Instagram Link</label>
                <input
                  name="website_or_social"
                  type="url"
                  value={form.website_or_social}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="input-field mt-1"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Private Verification Evidence */}
          <section className="space-y-4 border-t border-ivory-border pt-6">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
              <div>
                <h2 className="font-serif text-lg font-semibold text-ink">
                  3. Private Verification Evidence
                </h2>
                <p className="text-xs text-ink-muted">
                  Uploaded documents are strictly confidential and reviewed only by Varnika administrators.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink">
                  Identity / Business Verification Document (PDF/JPG/PNG, max 5MB) *
                </label>
                <input
                  type="file"
                  required
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => setIdentityDoc(e.target.files?.[0] || null)}
                  className="mt-1 block w-full text-xs text-ink-muted"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink">
                  Workshop / Artisan Craft Evidence (PDF/JPG/PNG, max 5MB)
                </label>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => setWorkshopEvidence(e.target.files?.[0] || null)}
                  className="mt-1 block w-full text-xs text-ink-muted"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink">
                  Additional Verification Notes (Artisan Card / Udyam / GI Tag details)
                </label>
                <textarea
                  name="additional_notes"
                  rows={2}
                  value={form.additional_notes}
                  onChange={handleChange}
                  className="input-field mt-1"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col justify-between gap-4 border-t border-ivory-border pt-6 sm:flex-row sm:items-center">
            <Link to="/seller/login" className="text-sm font-medium text-ink-muted hover:text-ink">
              Already applied? Seller Sign In
            </Link>
            <button type="submit" disabled={submitting} className="btn-forest px-8 py-3">
              {submitting ? 'Submitting Application...' : 'Submit Verification Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}