import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/errors';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  return (
    <main className="auth-page">
      <section className="hero-panel">
        <p className="eyebrow">Production-minded flow</p>
        <h1>Spin up your workspace with RBAC, token rotation, and a clean task board.</h1>
        <p>
          This UI is intentionally small, but the backend behind it is structured like something a real team can
          keep growing.
        </p>
      </section>

      <section className="auth-card">
        <div className="surface-header">
          <div>
            <p className="eyebrow">Create account</p>
            <h2>Register</h2>
          </div>
        </div>

        <form
          className="task-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setError('');
            setIsSubmitting(true);

            try {
              await register(form);
              navigate('/dashboard', { replace: true });
            } catch (submitError) {
              setError(getErrorMessage(submitError));
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <label className="field">
            <span>Name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
              minLength={2}
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              type="email"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              type="password"
              required
              minLength={8}
            />
          </label>

          {error ? <div className="notice error">{error}</div> : null}

          <button className="button primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already signed up? <Link to="/login">Go to login</Link>
        </p>
      </section>
    </main>
  );
};
