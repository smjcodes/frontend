'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUser, isContestAdmin, logout, subscribeToAuthChanges } from '@/lib/auth';
import type { User } from '@/lib/types';

export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const syncUser = () => setUser(getUser());

    syncUser();
    return subscribeToAuthChanges(syncUser);
  }, []);

  if (!user) {
    return (
      <div className="auth-box">
        <span className="muted">Guest mode</span>
        <Link className="button secondary" href="/login">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-box">
      <div>
        <strong>{user.username}</strong>
        <div className="small muted">
          {user.email} | {user.userType}
          {isContestAdmin(user) ? ' | contest-admin' : ''}
        </div>
      </div>
      <button className="button secondary" onClick={() => void logout()} type="button">
        Logout
      </button>
    </div>
  );
}
