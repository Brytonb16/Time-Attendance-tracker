
import { getDb, initDb } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';

export async function POST(request) {
  const authError = requireAuth();
  if (authError) return authError;

  await initDb();
  const db = getDb();
  const body = await request.json();
  const name = String(body.name || '').trim();
  if (!name) return Response.json({ error: 'Name is required' }, { status: 400 });

  await db.sql`
    INSERT INTO employees (name, store, position, status)
    VALUES (${name}, ${body.store || ''}, ${body.position || ''}, ${body.status || 'Active'});
  `;
  return Response.json({ ok: true });
}
