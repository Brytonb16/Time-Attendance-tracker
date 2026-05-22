
import { neon } from '@neondatabase/serverless';

let db;

export function getConnectionString() {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ''
  );
}

export function getDatabaseStatus() {
  return {
    hasPostgresUrl: Boolean(process.env.POSTGRES_URL),
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasPostgresPrismaUrl: Boolean(process.env.POSTGRES_PRISMA_URL),
    hasPostgresNonPoolingUrl: Boolean(process.env.POSTGRES_URL_NON_POOLING)
  };
}

export function getDb() {
  const connectionString = getConnectionString();

  if (!connectionString) {
    throw new Error('Missing database connection string. In Vercel, connect Storage or add POSTGRES_URL or DATABASE_URL to this project for Production.');
  }

  if (!db) {
    const sql = neon(connectionString, { fullResults: true });
    db = { sql };
  }

  return db;
}

export async function initDb() {
  const db = getDb();

  await db.sql`
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      store TEXT DEFAULT '',
      position TEXT DEFAULT '',
      status TEXT DEFAULT 'Active',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await db.sql`
    CREATE TABLE IF NOT EXISTS incidents (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      points NUMERIC NOT NULL,
      incident_date DATE NOT NULL,
      pay_period TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      expires_at DATE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
}

export function getIncidentRule(type, incidentDate) {
  const date = new Date(incidentDate + 'T00:00:00');
  let points = 0;
  let months = 0;
  let days = 0;

  if (type === 'missed_punches') {
    points = 0.5;
    days = 90;
  } else if (type === 'late_under_10') {
    points = 0.25;
    months = 6;
  } else if (type === 'late_over_10') {
    points = 0.5;
    months = 6;
  } else if (type === 'absence') {
    points = 1;
    months = 12;
  } else if (type === 'monday_absence') {
    points = 2;
    months = 12;
  } else {
    throw new Error('Invalid incident type');
  }

  const expires = new Date(date);
  if (months) expires.setMonth(expires.getMonth() + months);
  if (days) expires.setDate(expires.getDate() + days);

  return {
    points,
    expires_at: expires.toISOString().slice(0, 10)
  };
}

export function disciplineStage(points) {
  const n = Number(points || 0);
  if (n >= 12) return { label: 'Separation Review', color: 'red' };
  if (n >= 6) return { label: 'Write Up', color: 'orange' };
  if (n >= 3) return { label: 'Verbal', color: 'yellow' };
  return { label: 'Good Standing', color: 'green' };
}

export function typeLabel(type) {
  return {
    missed_punches: '3 Missed Punches / Pay Period',
    late_under_10: 'Late < 10 Minutes',
    late_over_10: 'Late > 10 Minutes',
    absence: 'Absence',
    monday_absence: 'Monday Absence'
  }[type] || type;
}
