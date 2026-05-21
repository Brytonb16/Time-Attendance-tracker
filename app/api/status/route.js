
import { initDb } from '../../../lib/db';

export async function GET() {
  try {
    await initDb();
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
