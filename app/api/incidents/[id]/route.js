
import { getDb, initDb } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/auth';

export async function DELETE(request, { params }) {
  const authError = await requireAuth();
  if (authError) return authError;

  await initDb();
  const db = getDb();
  await db.sql`DELETE FROM incidents WHERE id = ${params.id};`;
  return Response.json({ ok: true });
}
