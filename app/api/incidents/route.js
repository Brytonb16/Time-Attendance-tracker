
import { getDb, initDb, getIncidentRule } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';

export async function POST(request) {
  const authError = requireAuth();
  if (authError) return authError;

  await initDb();
  const db = getDb();
  const body = await request.json();
  const employeeId = Number(body.employee_id);
  const type = String(body.type || '');
  const incidentDate = String(body.incident_date || '');

  if (!employeeId || !type || !incidentDate) {
    return Response.json({ error: 'Employee, type, and date are required' }, { status: 400 });
  }

  const rule = getIncidentRule(type, incidentDate);

  await db.sql`
    INSERT INTO incidents (employee_id, type, points, incident_date, pay_period, notes, expires_at)
    VALUES (${employeeId}, ${type}, ${rule.points}, ${incidentDate}, ${body.pay_period || ''}, ${body.notes || ''}, ${rule.expires_at});
  `;
  return Response.json({ ok: true });
}
