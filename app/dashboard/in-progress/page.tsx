'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingState from '@/components/LoadingState';
import { getToken } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import type { HistoryEntry } from '@/lib/types';
import { getInProgress } from '@/services/user.service';

export default function InProgressPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      setError('Authentication required. Please log in first.');
      return;
    }

    const loadEntries = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getInProgress(token);
        setEntries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load in-progress contests.');
      } finally {
        setLoading(false);
      }
    };

    void loadEntries();
  }, []);

  return (
    <section className="page">
      <div className="card stack">
        <div className="row">
          <h1>In Progress Contests</h1>
          <Link className="button secondary" href="/dashboard">
            Back To Dashboard
          </Link>
        </div>
        <ErrorMessage message={error} />
      </div>

      {loading ? <LoadingState label="Loading in-progress contests..." /> : null}

      <div className="grid">
        {!loading && entries.length === 0 ? (
          <div className="card empty-state muted">No joined but unfinished contests found.</div>
        ) : null}

        {entries.map((entry) => (
          <div className="card stack" key={entry.id}>
            <div className="row">
              <h2>{entry.contest?.title || 'Contest'}</h2>
              <span className={`badge ${entry.contest?.accessLevel === 'VIP' ? 'badge-vip' : 'badge-normal'}`}>
                {entry.contest?.accessLevel || 'UNKNOWN'}
              </span>
            </div>
            <p className="muted">{entry.contest?.description}</p>
            <p>Started: {formatDateTime(entry.startedAt)}</p>
            <div className="actions">
              {entry.contest ? (
                <Link className="button" href={`/contests/${entry.contest.id}`}>
                  Continue Contest
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
