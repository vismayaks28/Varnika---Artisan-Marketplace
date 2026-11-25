import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { extractApiError } from '../../utils/formatters';
import ErrorMessage from '../../components/ErrorMessage';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login({ email, password, expected_role: 'buyer' });
      navigate(user.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard', {
        replace: true,
      });
    } catch (err) {
      setError(extractApiError(err, 'Invalid buyer email or password.').message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="card-surface p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
          Collector Sign In
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">
          Sign In to Varnika
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Access your wishlist, shopping cart, saved addresses, and orders.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <ErrorMessage message={error} />

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field mt-1"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input-field mt-1"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 space-y-2 border-t border-ivory-border pt-4 text-center text-sm text-ink-muted">
          <p>
            New to Varnika?{' '}
            <Link to="/register" className="font-semibold text-terracotta hover:underline">
              Create Buyer Account
            </Link>
          </p>
          <p className="text-xs">
            Are you an artisan or craft brand?{' '}
            <Link to="/sell" className="font-semibold text-forest hover:underline">
              Visit Seller Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}