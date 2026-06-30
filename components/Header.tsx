'use client';

import Link from 'next/link';
import AuthStatus from './AuthStatus';

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div>
          <Link className="brand" href="/">
            Contest Demo UI
          </Link>
          <nav className="nav">
            <Link href="/contests">Contests</Link>
            <Link href="/leaderboard">Leaderboard</Link>
            <Link href="/scoring">Scoring</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/login">Login</Link>
          </nav>
        </div>
        <AuthStatus />
      </div>
    </header>
  );
}
