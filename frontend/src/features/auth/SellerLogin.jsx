import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { extractApiError } from '../../utils/formatters';
import ErrorMessage from '../../components/ErrorMessage';

export default function SellerLogin() {
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
      await login({ email, password, expected_role: 'seller' });
      navigate('/seller/dashboard', { replace: true });
    } catch (err) {
      setError(extractApiError(err, 'Invalid seller credentials.').message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="card-surface p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest">
          Artisan Partner Portal
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">
          Seller Studio Sign In
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Sign in to manage your craft brand, verification status, inventory, and orders.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <ErrorMessage message={error} />

          <div>
            <label className="block text-sm font-medium text-ink">Registered Seller Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field mt-1"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-forest w-full py-2.5">
            {submitting ? 'Signing In...' : 'Enter Seller Studio'}
          </button>
        </form>

        <div className="mt-6 space-y-2 border-t border-ivory-border pt-4 text-center text-sm text-ink-muted">
          <p>
            Don&apos;t have a seller account yet?{' '}
            <Link to="/seller/apply" className="font-semibold text-forest hover:underline">
              Apply to Become a Seller
            </Link>
          </p>
          <p className="text-xs">
            Looking to shop?{' '}
            <Link to="/login" className="font-semibold text-terracotta hover:underline">
              Buyer Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}