# Demo Frontend

This `frontend/` app is a minimal Next.js demo UI for the Strapi Contest Participation System backend.

It exists to help reviewers test the assignment end-to-end without relying only on Postman. The backend remains the primary assignment deliverable.

## Stack

- Next.js App Router
- TypeScript
- Browser `localStorage` for demo JWT persistence

## Environment Variable

Create `frontend/.env.local` from `frontend/.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:1337
```

## Setup Commands

Run these from the `frontend/` directory:

```powershell
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

## Run Backend And Frontend Together

Terminal 1, backend:

```powershell
pnpm install
pnpm develop
```

Terminal 2, frontend:

```powershell
cd frontend
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Test Users

- Normal user: `normal@example.com` / `Password123!`
- VIP user: `vip@example.com` / `Password123!`
- Contest API admin: `contestadmin@example.com` / `Password123!`

## Testing Flow

1. Start the Strapi backend on `http://localhost:1337`.
2. Start the Next.js frontend in `frontend/`.
3. Open the home page and confirm guest users can browse contests.
4. Login as `normal@example.com`.
5. Open `/contests`, enter a `NORMAL` contest, and join it.
6. Submit answers and confirm the returned score is shown.
7. Open the contest leaderboard.
8. Check `/dashboard/history` and `/dashboard/in-progress`.
9. Logout and login as `vip@example.com`.
10. Join a `VIP` contest.
11. Logout and login as `contestadmin@example.com`.
12. Open a leaderboard page and award the prize.
13. Check `/dashboard/prizes` for a winning user.

## Notes

- The UI intentionally does not display correct answers.
- The frontend uses the backend score response and does not calculate scores locally.
- The frontend is intentionally simple and optimized for reviewer testing rather than design polish.
