'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingState from '@/components/LoadingState';
import { getToken } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import type { PrizeWinner } from '@/lib/types';
import { getPrizes } from '@/services/user.service';

export default function PrizesPage() {
  const [prizes, setPrizes] = useState<PrizeWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      setError('Authentication required. Please log in first.');
      return;
    }

    const loadPrizes = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getPrizes(token);
        setPrizes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load prizes.');
      } finally {
        setLoading(false);
      }
    };

    void loadPrizes();
  }, []);

  return (
    <section className="page">
      <div className="card stack">
        <div className="row">
          <h1>Prizes Won</h1>
          <Link className="button secondary" href="/dashboard">
            Back To Dashboard
          </Link>
        </div>
        <ErrorMessage message={error} />
      </div>

      {loading ? <LoadingState label="Loading prizes..." /> : null}

      <div className="grid">
        {!loading && prizes.length === 0 ? (
          <div className="card empty-state muted">No prizes awarded to this account yet.</div>
        ) : null}

        {prizes.map((prize) => (
          <div className="card stack" key={prize.id}>
            <div className="row">
              <h2>{prize.contest?.title || 'Contest Prize'}</h2>
              <span className={`badge ${prize.contest?.accessLevel === 'VIP' ? 'badge-vip' : 'badge-normal'}`}>
                {prize.contest?.accessLevel || 'UNKNOWN'}
              </span>
            </div>
            <p>Prize: {prize.prizeInfo || '-'}</p>
            <p>Awarded At: {formatDateTime(prize.awardedAt)}</p>
            <p>Participation Score: {prize.participation?.score ?? '-'}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
