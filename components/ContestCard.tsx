'use client';

import Link from 'next/link';
import { canParticipateInContest } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import type { Contest, User } from '@/lib/types';

type ContestCardProps = {
  contest: Contest;
  user: User | null;
};

export default function ContestCard({ contest, user }: ContestCardProps) {
  const isLocked = contest.accessLevel === 'VIP' && !canParticipateInContest(user, contest);

  return (
    <article className="card contest-card">
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
          <dt>Start</dt>
          <dd>{formatDateTime(contest.startTime)}</dd>
        </div>
        <div>
          <dt>End</dt>
          <dd>{formatDateTime(contest.endTime)}</dd>
        </div>
        <div>
          <dt>Active</dt>
          <dd>{contest.isActive ? 'Yes' : 'No'}</dd>
        </div>
        <div>
          <dt>Prize Awarded</dt>
          <dd>{contest.hasPrizeWinner ? 'Yes' : 'No'}</dd>
        </div>
      </dl>

      {!user && <p className="muted">Login required to participate.</p>}
      {user && isLocked && (
        <p className="muted">VIP contest locked for this account. Use a VIP or contest admin user.</p>
      )}

      <div className="actions">
        <Link className="button" href={`/contests/${contest.id}`}>
          View Contest
        </Link>
      </div>
    </article>
  );
}
