'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingState from '@/components/LoadingState';
import { getToken } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import type { HistoryEntry } from '@/lib/types';
import { getHistory } from '@/services/user.service';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      setError('Authentication required. Please log in first.');
      return;
    }

    const loadHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getHistory(token);
        setHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history.');
      } finally {
        setLoading(false);
      }
    };

    void loadHistory();
  }, []);

  return (
    <section className="page">
      <div className="card stack">
        <div className="row">
          <h1>History</h1>
          <Link className="button secondary" href="/dashboard">
            Back To Dashboard
          </Link>
        </div>
        <ErrorMessage message={error} />
      </div>

      {loading ? <LoadingState label="Loading history..." /> : null}

      <div className="grid">
        {!loading && history.length === 0 ? (
          <div className="card empty-state muted">No participation history found.</div>
        ) : null}

        {history.map((entry) => (
          <div className="card stack" key={entry.id}>
            <div className="row">
              <h2>{entry.contest?.title || 'Contest'}</h2>
              <span className={`badge ${entry.contest?.accessLevel === 'VIP' ? 'badge-vip' : 'badge-normal'}`}>
                {entry.contest?.accessLevel || 'UNKNOWN'}
              </span>
            </div>
            <p className="muted">{entry.contest?.description}</p>
            <p>Status: {entry.status}</p>
            <p>Score: {entry.score}</p>
            <p>Started: {formatDateTime(entry.startedAt)}</p>
            <p>Submitted: {formatDateTime(entry.submittedAt)}</p>
            <p>Prize Awarded: {entry.prizeAwarded ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
