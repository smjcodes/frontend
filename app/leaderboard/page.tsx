'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingState from '@/components/LoadingState';
import { getContests } from '@/services/contest.service';
import type { Contest } from '@/lib/types';
import { formatDateTime } from '@/lib/format';

export default function LeaderboardLandingPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContests = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getContests();
        setContests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contests.');
      } finally {
        setLoading(false);
      }
    };

    void loadContests();
  }, []);

  return (
    <section className="page">
      <div className="card stack">
        <h1>Public Leaderboards</h1>
        <p className="muted">
          Anyone can view contest leaderboards here. Select a contest to open its leaderboard page.
        </p>
      </div>

      <ErrorMessage message={error} />
      {loading ? <LoadingState label="Loading contests..." /> : null}

      <div className="grid two">
        {contests.map((contest) => (
          <article className="card contest-card" key={contest.id}>
            <div className="row">
              <h3>{contest.title}</h3>
              <span className={`badge ${contest.accessLevel === 'VIP' ? 'badge-vip' : 'badge-normal'}`}>
                {contest.accessLevel}
              </span>
            </div>
            <p>{contest.description}</p>
            <dl className="meta-grid">
              <div>
                <dt>Prize</dt>
                <dd>{contest.prizeInfo || '-'}</dd>
              </div>
              <div>
                <dt>Questions</dt>
                <dd>{contest.questionCount}</dd>
              </div>
              <div>
                <dt>Ends</dt>
                <dd>{formatDateTime(contest.endTime)}</dd>
              </div>
            </dl>

            <div className="actions">
              <Link className="button" href={`/contests/${contest.id}/leaderboard`}>
                View Leaderboard
              </Link>
            </div>
          </article>
        ))}
      </div>

      {!loading && contests.length === 0 ? (
        <div className="card empty-state muted">No contests are available right now.</div>
      ) : null}
    </section>
  );
}
