
TIME & ATTENDANCE TRACKER - VERCEL/GITHUB VERSION

This version is built for Vercel and GitHub.
It uses Vercel Postgres, not SQLite, so data can persist online.

RULES INCLUDED
- 3 missed punches per pay period = 0.5 point, expires after 90 days
- Late under 10 minutes = 0.25 point, expires after 6 months
- Late over 10 minutes = 0.5 point, expires after 6 months
- Absence = 1 point, expires after 12 months
- Monday absence = 2 points, expires after 12 months

DISCIPLINE LEVELS
- 3 points = Verbal
- 6 points = Write Up
- 12 points = Separation Review

DEPLOY TO GITHUB + VERCEL
1. Create a new GitHub repo.
2. Upload all files from this folder to that repo.
3. Go to Vercel.
4. Import the GitHub repo.
5. In Vercel, create a Postgres database:
   Project > Storage > Create Database > Postgres
6. Add these Environment Variables in Vercel:
   DATABASE_URL = your Vercel Postgres connection string
   EMAIL_ENABLED = false
   NEXT_PUBLIC_APP_PASSWORD = your desired login password
7. Redeploy the project.

IMPORTANT
Do not use the old SQLite database file on Vercel.
This version creates its own cloud tables automatically.

LOCAL TESTING
npm install
npm run dev

Then open:
http://localhost:3000
