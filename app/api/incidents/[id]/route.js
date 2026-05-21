
import { sql } from '@vercel/postgres';
import { initDb } from '../../../../lib/db';

export async function DELETE(request, { params }) {
  await initDb();
  await sql`DELETE FROM incidents WHERE id = ${params.id};`;
  return Response.json({ ok: true });
}
