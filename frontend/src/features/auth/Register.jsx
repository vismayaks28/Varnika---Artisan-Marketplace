import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { extractApiError } from '../../utils/formatters';
import ErrorMessage from '../../components/ErrorMessage';

export default function Register() {
  const { registerBuyer } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    location: '',
    password: '',
  });
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
    setSubmitting(true);

    try {
      await registerBuyer(form);
      navigate('/buyer/dashboard', { replace: true });
    } catch (err) {
      const parsed = extractApiError(err, 'Could not create buyer account.');
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="card-surface p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
          Join as a Collector
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">
          Create Buyer Account
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Shop authentic Indian handicrafts directly from verified artisan workshops.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <ErrorMessage message={error} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-ink">First Name</label>
              <input
                name="first_name"
                type="text"
                required
                value={form.first_name}
                onChange={handleChange}
                className="input-field mt-1"
              />
              {fieldErrors.first_name && (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Last Name</label>
              <input
                name="last_name"
                type="text"
                required
                value={form.last_name}
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
              <label className="block text-sm font-medium text-ink">Email Address</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="input-field mt-1"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Phone Number</label>
              <input
                name="phone"
                type="tel"
                required
                value={form.phone}
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
            <label className="block text-sm font-medium text-ink">City &amp; State</label>
            <input
              name="location"
              type="text"
              required
              value={form.location}
              onChange={handleChange}
              placeholder="e.g., Bengaluru, Karnataka"
              className="input-field mt-1"
            />
            {fieldErrors.location && (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.location}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">
              Password (minimum 8 characters, mix of letters &amp; numbers)
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

          <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
            {submitting ? 'Creating Account...' : 'Create Buyer Account'}
          </button>
        </form>

        <div className="mt-6 space-y-2 border-t border-ivory-border pt-4 text-center text-sm text-ink-muted">
          <p>
            Already have a buyer account?{' '}
            <Link to="/login" className="font-semibold text-terracotta hover:underline">
              Sign In
            </Link>
          </p>
          <p className="text-xs">
            Want to sell handmade crafts on Varnika?{' '}
            <Link to="/sell" className="font-semibold text-forest hover:underline">
              Apply as an Artisan Brand
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}