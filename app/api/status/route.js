
import { getDatabaseStatus, initDb } from '../../../lib/db';

export async function GET() {
  try {
    await initDb();
    return Response.json({ ok: true, database: getDatabaseStatus() });
  } catch (err) {
    return Response.json({ ok: false, error: err.message, database: getDatabaseStatus() }, { status: 500 });
  }
}
