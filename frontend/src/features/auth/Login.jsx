import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { extractApiError } from '../../utils/formatters';
import ErrorMessage from '../../components/ErrorMessage';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const loggedInUser = await login(formData);
      if (loggedInUser.role === 'seller') {
        navigate('/seller/dashboard', { replace: true });
      } else {
        navigate('/buyer/dashboard', { replace: true });
      }
    } catch (err) {
      const parsed = extractApiError(err, 'Unable to sign in. Check your credentials.');
      setError(parsed.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="card-surface p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
          Welcome Back
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">
          Sign in to Varnika
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Access your artisan studio or track your craft enquiries.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <ErrorMessage message={error} />

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
              placeholder="artisan@example.com"
              className="input-field mt-1"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="input-field mt-1"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          New to Varnika?{' '}
          <Link to="/register" className="font-semibold text-terracotta hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}