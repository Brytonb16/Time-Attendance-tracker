# Time & Attendance Tracker

A private Next.js web app for tracking employee attendance incidents, point totals, expiration dates, and discipline thresholds.

## Attendance Rules

- 3 missed punches per pay period: 0.5 point, expires after 90 days
- Late under 10 minutes: 0.25 point, expires after 6 months
- Late over 10 minutes: 0.5 point, expires after 6 months
- Absence: 1 point, expires after 12 months
- Monday absence: 2 points, expires after 12 months

## Discipline Levels

- 3 points: Verbal
- 6 points: Write Up
- 12 points: Separation Review

## Environment Variables

```text
POSTGRES_URL=your pooled Postgres connection string
APP_PASSWORD=your company login password
```

`DATABASE_URL` is also supported if your database provider uses that name.

## Deploy To Vercel

1. Push this folder to a GitHub repository.
2. Import the repository in Vercel.
3. Add a Postgres database from Vercel Storage or connect another hosted Postgres database.
4. Add the environment variables above in Vercel.
5. Deploy the project.

The app creates the required database tables automatically the first time an authenticated user loads data.

## Local Testing

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.
