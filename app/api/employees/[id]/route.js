
import { getDb, initDb } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/auth';

export async function DELETE(request, { params }) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  await initDb();
  const db = getDb();
  await db.sql`DELETE FROM employees WHERE id = ${id};`;
  return Response.json({ ok: true });
}
