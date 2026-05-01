import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/errors';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('Password123!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const redirectTarget = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';

  return (
    <main className="auth-page">
      <section className="hero-panel">
        <p className="eyebrow">Task Platform</p>
        <h1>Run a secure task engine without the toy-project shortcuts.</h1>
        <p>
          Access tokens stay in memory, refresh tokens rotate through `httpOnly` cookies, and the dashboard
          stays focused on work instead of ceremony.
        </p>
      </section>

      <section className="auth-card">
        <div className="surface-header">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h2>Sign in</h2>
          </div>
        </div>

        <form
          className="task-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setError('');
            setIsSubmitting(true);

            try {
              await login({ email, password });
              navigate(redirectTarget, { replace: true });
            } catch (submitError) {
              setError(getErrorMessage(submitError));
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <label className="field">
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
            />
          </label>

          {error ? <div className="notice error">{error}</div> : null}

          <button className="button primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  );
};
