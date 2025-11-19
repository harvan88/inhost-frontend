import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAPI } from '../../lib/api/admin-client';
import { useAuthStore } from '../../store/auth-store';
import { syncService } from '../../services/sync';

export default function SignupPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    // Validate password length
    const password = formData.get('password') as string;
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await adminAPI.signup({
        email: formData.get('email') as string,
        password: password,
        name: formData.get('name') as string,
        tenantName: formData.get('tenantName') as string,
        plan: (formData.get('plan') as any) || 'starter'
      });

      if (response.success) {
        const accessToken = response.data.tokens.accessToken;

        // 1. Set auth token (stores in localStorage)
        console.log('💾 Saving token after signup:', {
          hasToken: !!accessToken,
          tokenLength: accessToken?.length,
          tokenPreview: accessToken ? accessToken.substring(0, 30) + '...' : 'undefined'
        });

        setAuth(accessToken, response.data.user);

        // 2. Sync data from backend (now that we have token)
        try {
          await syncService.syncFromBackend();
          console.log('✅ Backend sync after signup successful');
        } catch (syncError) {
          console.warn('⚠️ Backend sync failed after signup, using local data:', syncError);
          // Continue anyway - user can still use local data
        }

        // 3. Reload data from IndexedDB (now has fresh backend data)
        await syncService.loadFromIndexedDB();

        // 4. Navigate to workspace
        navigate('/workspace');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Start your 14-day free trial
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="tenantName"
              className="block text-sm font-medium text-gray-700"
            >
              Company Name
            </label>
            <input
              id="tenantName"
              name="tenantName"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Acme Inc."
            />
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Your Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimum 6 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="plan"
              className="block text-sm font-medium text-gray-700"
            >
              Plan
            </label>
            <select
              id="plan"
              name="plan"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="starter">Starter (Free)</option>
              <option value="professional">Professional ($49/mo)</option>
              <option value="enterprise">Enterprise ($199/mo)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
