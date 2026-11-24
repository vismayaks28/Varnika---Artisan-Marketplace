import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { extractApiError } from '../../utils/formatters';
import ErrorMessage from '../../components/ErrorMessage';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'seller' ? 'seller' : 'buyer';

  const [formData, setFormData] = useState({
    role: initialRole,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    location: '',
    craft_specialty: '',
    bio: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);

    try {
      const createdUser = await register(formData);
      if (createdUser.role === 'seller') {
        navigate('/seller/dashboard', { replace: true });
      } else {
        navigate('/buyer/dashboard', { replace: true });
      }
    } catch (err) {
      const parsed = extractApiError(err, 'Registration failed. Please check your details.');
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="card-surface p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
          Join Varnika
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">
          Create Your Account
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Choose how you want to participate in the marketplace.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <ErrorMessage message={error} />

          <div>
            <label className="block text-sm font-medium text-ink">Account Type</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'buyer' }))}
                className={`rounded-md border p-3.5 text-left transition-colors ${
                  formData.role === 'buyer'
                    ? 'border-forest bg-forest-light text-forest'
                    : 'border-ivory-border bg-white text-ink hover:bg-ivory-dark'
                }`}
              >
                <div className="text-sm font-semibold">Buyer / Collector</div>
                <div className="mt-0.5 text-xs opacity-80">
                  Discover crafts and enquire with makers
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'seller' }))}
                className={`rounded-md border p-3.5 text-left transition-colors ${
                  formData.role === 'seller'
                    ? 'border-terracotta bg-terracotta-light text-terracotta'
                    : 'border-ivory-border bg-white text-ink hover:bg-ivory-dark'
                }`}
              >
                <div className="text-sm font-semibold">Artisan / Seller</div>
                <div className="mt-0.5 text-xs opacity-80">
                  List handmade works and manage enquiries
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-ink">
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="input-field mt-1"
              />
              {fieldErrors.first_name && (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.first_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-ink">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="input-field mt-1"
              />
              {fieldErrors.last_name && (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.last_name}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field mt-1"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-ink">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="input-field mt-1"
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-ink">
              City &amp; State
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Jaipur, Rajasthan"
              className="input-field mt-1"
            />
            {fieldErrors.location && (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.location}</p>
            )}
          </div>

          {formData.role === 'seller' && (
            <>
              <div>
                <label htmlFor="craft_specialty" className="block text-sm font-medium text-ink">
                  Craft Specialty
                </label>
                <input
                  id="craft_specialty"
                  name="craft_specialty"
                  type="text"
                  value={formData.craft_specialty}
                  onChange={handleChange}
                  placeholder="e.g., Blue Pottery, Handloom Banarasi Weaving, Brassware"
                  className="input-field mt-1"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-ink">
                  Workshop Story (Optional)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Describe your craft tradition, materials, or studio background..."
                  className="input-field mt-1"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink">
              Password (minimum 8 characters)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={handleChange}
              className="input-field mt-1"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.password}</p>
            )}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-terracotta hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}