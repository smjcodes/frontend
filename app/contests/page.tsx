'use client';

import { useEffect, useState } from 'react';
import ContestCard from '@/components/ContestCard';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingState from '@/components/LoadingState';
import { getUser, subscribeToAuthChanges } from '@/lib/auth';
import type { Contest, User } from '@/lib/types';
import { getContests } from '@/services/contest.service';

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncUser = () => setUser(getUser());

    syncUser();

    const load = async () => {
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

    void load();
    return subscribeToAuthChanges(syncUser);
  }, []);

  return (
    <section className="page">
      <div className="card stack">
        <h1>Contests</h1>
        <p className="muted">
          Public page. Guests can browse contests, but only authenticated users can join and submit.
        </p>
        {!user ? <div className="alert alert-success">Login required to participate.</div> : null}
      </div>

      <ErrorMessage message={error} />

      {loading ? <LoadingState label="Loading contests..." /> : null}

      <div className="grid two">
        {contests.map((contest) => (
          <ContestCard contest={contest} key={contest.id} user={user} />
        ))}
      </div>

      {!loading && contests.length === 0 ? (
        <div className="card empty-state muted">No contests found.</div>
      ) : null}
    </section>
  );
}
