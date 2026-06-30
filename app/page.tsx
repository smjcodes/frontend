import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="page">
      <div className="card hero">
        <h1>Contest Participation Demo UI</h1>
        <p>
          This is a simple Next.js testing interface for the Strapi Contest Participation System.
          It is intentionally basic and focused on exercising the assignment flows quickly.
        </p>
        <div className="actions">
          <Link className="button" href="/login">
            Go To Login
          </Link>
          <Link className="button secondary" href="/contests">
            Browse Contests
          </Link>
          <Link className="button secondary" href="/dashboard">
            Open Dashboard
          </Link>
        </div>
      </div>

      <div className="grid two">
        <div className="card stack">
          <h2>What reviewers can test here</h2>
          <p>Guest browsing, login, join, submit, leaderboard, user history, in-progress contests, and prizes.</p>
        </div>
        <div className="card stack">
          <h2>Important rule</h2>
          <p>Correct answers are never shown in the UI. The frontend only sends selected option IDs and shows the backend result.</p>
        </div>
      </div>
    </section>
  );
}
