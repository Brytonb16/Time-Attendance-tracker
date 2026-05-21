
import { sql } from '@vercel/postgres';
import { initDb } from '../../../lib/db';

export async function POST(request) {
  await initDb();
  const body = await request.json();
  const name = String(body.name || '').trim();
  if (!name) return Response.json({ error: 'Name is required' }, { status: 400 });

  await sql`
    INSERT INTO employees (name, store, position, status)
    VALUES (${name}, ${body.store || ''}, ${body.position || ''}, ${body.status || 'Active'});
  `;
  return Response.json({ ok: true });
}
