'use client';

import { useEffect, useState } from 'react';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingState from '@/components/LoadingState';
import { getToken, getUser, isContestAdmin, subscribeToAuthChanges } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import type { LeaderboardResponse, User } from '@/lib/types';
import { awardPrize, getLeaderboard } from '@/services/contest.service';

type LeaderboardPageProps = {
  params: {
    id: string;
  };
};

export default function LeaderboardPage({ params }: LeaderboardPageProps) {
  const contestId = params.id;
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [awarding, setAwarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const syncUser = () => setUser(getUser());

    syncUser();

    const loadLeaderboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getLeaderboard(contestId);
        setLeaderboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard.');
      } finally {
        setLoading(false);
      }
    };

    void loadLeaderboard();
    return subscribeToAuthChanges(syncUser);
  }, [contestId]);

  const handleAwardPrize = async () => {
    const token = getToken();

    if (!token) {
      setError('Login as the contest admin to award a prize.');
      return;
    }

    setAwarding(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await awardPrize(contestId, token);
      setSuccess(
        `Prize awarded successfully for ${result.contest?.title || 'this contest'} at ${formatDateTime(
          result.awardedAt
        )}.`
      );

      const refreshed = await getLeaderboard(contestId);
      setLeaderboard(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to award prize.');
    } finally {
      setAwarding(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading leaderboard..." />;
  }

  return (
    <section className="page">
      <div className="card stack">
        <h1>Leaderboard</h1>
        <p className="muted">
          Only submitted participations appear here. Sorting is handled by the backend.
        </p>
        {leaderboard ? (
          <div className="small muted">
            Contest: {leaderboard.contest.title} | Prize awarded:{' '}
            {leaderboard.contest.hasPrizeWinner ? 'Yes' : 'No'}
          </div>
        ) : null}

        {isContestAdmin(user) ? (
          <div className="actions">
            <button
              className="button"
              disabled={awarding}
              onClick={() => void handleAwardPrize()}
              type="button"
            >
              {awarding ? 'Awarding...' : 'Award Prize'}
            </button>
            <span className="muted small">Visible only for the contest API admin account.</span>
          </div>
        ) : null}

        <ErrorMessage message={error} />
        {success ? <div className="alert alert-success">{success}</div> : null}
      </div>

      <div className="card table-wrap">
        {leaderboard && leaderboard.entries.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>User Type</th>
                <th>Score</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.entries.map((entry) => (
                <tr key={`${entry.user.id}-${entry.rank}`}>
                  <td>{entry.rank}</td>
                  <td>{entry.user.username}</td>
                  <td>{entry.user.userType}</td>
                  <td>{entry.score}</td>
                  <td>{formatDateTime(entry.submittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state muted">No submitted participations yet.</div>
        )}
      </div>
    </section>
  );
}
