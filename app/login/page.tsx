'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ErrorMessage from '@/components/ErrorMessage';
import { getUser, isLoggedIn, logout, subscribeToAuthChanges } from '@/lib/auth';
import type { User } from '@/lib/types';
import { login } from '@/services/auth.service';

const presets = [
  { label: 'Login as Normal User', email: 'normal@example.com', password: 'Password123!' },
  { label: 'Login as VIP User', email: 'vip@example.com', password: 'Password123!' },
  {
    label: 'Login as Contest Admin',
    email: 'contestadmin@example.com',
    password: 'Password123!',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('normal@example.com');
  const [password, setPassword] = useState('Password123!');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const syncUser = () => setUser(getUser());

    syncUser();
    if (isLoggedIn()) {
      router.replace('/contests');
      return undefined;
    }

    return subscribeToAuthChanges(syncUser);
  }, [router]);

  const handleLogin = async (identifier: string, passwordValue: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await login(identifier, passwordValue);
      setUser(response.user);
      setSuccess(`Logged in as ${response.user.email}.`);
      router.replace('/contests');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <div className="card stack">
        <h1>Login</h1>
        <p className="muted">
          Use the seeded demo accounts or enter credentials manually. JWT is stored in
          browser localStorage for this interview demo only.
        </p>
        <ErrorMessage message={error} />
        {success ? <div className="alert alert-success">{success}</div> : null}

        <div className="actions">
          {presets.map((preset) => (
            <button
              key={preset.label}
              className="button secondary"
              disabled={loading}
              onClick={() => {
                setEmail(preset.email);
                setPassword(preset.password);
                void handleLogin(preset.email, preset.password);
              }}
              type="button"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card stack">
        <form
          className="input-grid"
          onSubmit={(event) => {
            event.preventDefault();
            void handleLogin(email, password);
          }}
        >
          <label>
            Email or identifier
            <input onChange={(event) => setEmail(event.target.value)} value={email} />
          </label>

          <label>
            Password
            <input
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>

          <div className="actions">
            <button className="button" disabled={loading} type="submit">
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button
              className="button secondary"
              onClick={() => {
                void logout().finally(() => {
                  setUser(null);
                  setSuccess('Logged out.');
                  setError(null);
                });
              }}
              type="button"
            >
              Logout
            </button>
          </div>
        </form>
      </div>

      <div className="card stack">
        <h2>Current auth status</h2>
        {user ? (
          <div className="stack">
            <p>
              <strong>User:</strong> {user.username}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>User Type:</strong> {user.userType}
            </p>
            <p>
              <strong>API Role:</strong> {user.role?.type || 'authenticated'}
            </p>
          </div>
        ) : (
          <p className="muted">Not logged in.</p>
        )}
      </div>
    </section>
  );
}
