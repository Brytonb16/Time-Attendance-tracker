
import { sql } from '@vercel/postgres';
import { initDb, disciplineStage, typeLabel } from '../../../lib/db';

export async function GET() {
  await initDb();
  const employeesResult = await sql`
    SELECT e.*,
      COALESCE(SUM(CASE WHEN i.expires_at >= CURRENT_DATE THEN i.points ELSE 0 END), 0) AS active_points
    FROM employees e
    LEFT JOIN incidents i ON i.employee_id = e.id
    GROUP BY e.id
    ORDER BY e.name ASC;
  `;

  const incidentsResult = await sql`
    SELECT i.*, e.name AS employee_name
    FROM incidents i
    JOIN employees e ON e.id = i.employee_id
    ORDER BY i.incident_date DESC, i.id DESC;
  `;

  const employees = employeesResult.rows.map(e => ({
    ...e,
    active_points: Number(e.active_points),
    stage: disciplineStage(e.active_points)
  }));

  const incidents = incidentsResult.rows.map(i => ({
    ...i,
    points: Number(i.points),
    type_label: typeLabel(i.type),
    active: new Date(i.expires_at) >= new Date(new Date().toISOString().slice(0,10))
  }));

  return Response.json({ employees, incidents });
}
