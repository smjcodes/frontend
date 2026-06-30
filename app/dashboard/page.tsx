'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ErrorMessage from '@/components/ErrorMessage';
import { getUser, subscribeToAuthChanges } from '@/lib/auth';
import type { User } from '@/lib/types';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const syncUser = () => setUser(getUser());

    syncUser();
    return subscribeToAuthChanges(syncUser);
  }, []);

  if (!user) {
    return (
      <section className="page">
        <div className="card stack">
          <h1>Dashboard</h1>
          <ErrorMessage message="Authentication required. Please log in first." />
          <div className="actions">
            <Link className="button" href="/login">
              Go To Login
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="card stack">
        <h1>Dashboard</h1>
        <p>
          Logged in as <strong>{user.username}</strong> ({user.email})
        </p>
        <p className="muted">
          User type: {user.userType} | API role: {user.role?.type || 'authenticated'}
        </p>
      </div>

      <div className="grid two">
        <Link className="card stack" href="/dashboard/history">
          <h2>History</h2>
          <p className="muted">See contests you joined or submitted.</p>
        </Link>

        <Link className="card stack" href="/dashboard/in-progress">
          <h2>In Progress</h2>
          <p className="muted">Resume contests that were joined but not submitted yet.</p>
        </Link>

        <Link className="card stack" href="/dashboard/prizes">
          <h2>Prizes</h2>
          <p className="muted">See awarded prizes linked to your account.</p>
        </Link>
      </div>
    </section>
  );
}
