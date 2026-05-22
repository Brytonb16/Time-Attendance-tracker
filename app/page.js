'use client';

import { useEffect, useMemo, useState } from 'react';

const incidentTypes = [
  ['missed_punches', '3 missed punches', '0.5 point, expires after 90 days'],
  ['late_under_10', 'Late under 10 minutes', '0.25 point, expires after 6 months'],
  ['late_over_10', 'Late over 10 minutes', '0.5 point, expires after 6 months'],
  ['absence', 'Absence', '1 point, expires after 12 months'],
  ['monday_absence', 'Monday absence', '2 points, expires after 12 months']
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function stageClass(label) {
  return String(label || '').toLowerCase().replaceAll(' ', '-');
}

export default function Home() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [employees, setEmployees] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({ name: '', store: '', position: '', status: 'Active' });
  const [incidentForm, setIncidentForm] = useState({ employee_id: '', type: 'late_under_10', incident_date: today(), pay_period: '', notes: '' });

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setAuthed(Boolean(data.authenticated)))
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed]);

  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    setBusy(false);

    if (!res.ok) {
      setError('The password did not match.');
      return;
    }

    setPassword('');
    setAuthed(true);
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuthed(false);
    setEmployees([]);
    setIncidents([]);
  }

  async function loadData() {
    setError('');
    const res = await fetch('/api/data');

    if (res.status === 401) {
      setAuthed(false);
      return;
    }

    if (!res.ok) {
      const text = await res.text();
      setError('The app could not load company attendance data. Check the database settings in Vercel. ' + text);
      return;
    }

    const data = await res.json();
    setEmployees(data.employees || []);
    setIncidents(data.incidents || []);
  }

  async function addEmployee(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeForm)
    });

    setBusy(false);

    if (!res.ok) {
      setError('Employee could not be added.');
      return;
    }

    setEmployeeForm({ name: '', store: '', position: '', status: 'Active' });
    loadData();
  }

  async function deleteEmployee(id) {
    if (!confirm('Delete this employee and all incident history? This cannot be undone.')) return;
    await fetch('/api/employees/' + id, { method: 'DELETE' });
    loadData();
  }

  async function addIncident(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidentForm)
    });

    setBusy(false);

    if (!res.ok) {
      setError('Incident could not be added.');
      return;
    }

    setIncidentForm({ employee_id: '', type: 'late_under_10', incident_date: today(), pay_period: '', notes: '' });
    loadData();
  }

  async function deleteIncident(id) {
    if (!confirm('Delete this incident entry?')) return;
    await fetch('/api/incidents/' + id, { method: 'DELETE' });
    loadData();
  }

  const summary = useMemo(() => {
    const activeIncidents = incidents.filter(i => i.active);
    const reviewCount = employees.filter(e => Number(e.active_points) >= 12).length;
    const warningCount = employees.filter(e => Number(e.active_points) >= 3 && Number(e.active_points) < 12).length;

    return {
      employees: employees.length,
      activeIncidents: activeIncidents.length,
      warningCount,
      reviewCount
    };
  }, [employees, incidents]);

  const selectedIncident = incidentTypes.find(([value]) => value === incidentForm.type);

  if (checkingSession) {
    return <main className="shell"><div className="loading">Opening attendance tracker...</div></main>;
  }

  if (!authed) {
    return (
      <main className="login-shell">
        <section className="login-panel" aria-label="Sign in">
          <p className="eyebrow">Company attendance</p>
          <h1>Time & Attendance Tracker</h1>
          <p className="lead">Securely track employees, attendance incidents, point totals, expirations, and discipline thresholds.</p>
          <form onSubmit={login} className="login-form">
            <label>
              Password
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoFocus required />
            </label>
            <button type="submit" disabled={busy}>{busy ? 'Checking...' : 'Log In'}</button>
          </form>
          {error && <p className="form-error">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Company attendance</p>
          <h1>Time & Attendance Tracker</h1>
        </div>
        <button className="ghost-button" onClick={logout}>Log Out</button>
      </header>

      {error && <div className="notice">{error}</div>}

      <section className="metrics" aria-label="Attendance summary">
        <article><span>Total employees</span><strong>{summary.employees}</strong></article>
        <article><span>Active incidents</span><strong>{summary.activeIncidents}</strong></article>
        <article><span>Warnings</span><strong>{summary.warningCount}</strong></article>
        <article><span>Separation reviews</span><strong>{summary.reviewCount}</strong></article>
      </section>

      <section className="two-column">
        <form onSubmit={addEmployee} className="panel">
          <div className="panel-heading"><h2>Add Employee</h2><p>Keep the roster current for point tracking.</p></div>
          <label>Name<input value={employeeForm.name} onChange={e => setEmployeeForm({ ...employeeForm, name: e.target.value })} required /></label>
          <div className="field-grid">
            <label>Store<input value={employeeForm.store} onChange={e => setEmployeeForm({ ...employeeForm, store: e.target.value })} /></label>
            <label>Position<input value={employeeForm.position} onChange={e => setEmployeeForm({ ...employeeForm, position: e.target.value })} /></label>
          </div>
          <label>Status<select value={employeeForm.status} onChange={e => setEmployeeForm({ ...employeeForm, status: e.target.value })}><option>Active</option><option>Inactive</option><option>Separated</option></select></label>
          <button disabled={busy}>Add Employee</button>
        </form>

        <form onSubmit={addIncident} className="panel">
          <div className="panel-heading"><h2>Add Incident</h2><p>{selectedIncident?.[2]}</p></div>
          <label>Employee<select required value={incidentForm.employee_id} onChange={e => setIncidentForm({ ...incidentForm, employee_id: e.target.value })}><option value="">Select employee</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></label>
          <label>Incident<select value={incidentForm.type} onChange={e => setIncidentForm({ ...incidentForm, type: e.target.value })}>{incidentTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <div className="field-grid">
            <label>Date<input type="date" value={incidentForm.incident_date} onChange={e => setIncidentForm({ ...incidentForm, incident_date: e.target.value })} required /></label>
            <label>Pay period<input value={incidentForm.pay_period} onChange={e => setIncidentForm({ ...incidentForm, pay_period: e.target.value })} /></label>
          </div>
          <label>Notes<textarea value={incidentForm.notes} onChange={e => setIncidentForm({ ...incidentForm, notes: e.target.value })} /></label>
          <button disabled={busy || employees.length === 0}>Add Incident</button>
        </form>
      </section>

      <section className="panel table-panel">
        <div className="panel-heading"><h2>Employee Standing</h2><p>3 points: Verbal. 6 points: Write Up. 12 points: Separation Review.</p></div>
        <div className="table-wrap"><table><thead><tr><th>Name</th><th>Store</th><th>Position</th><th>Active points</th><th>Status</th><th aria-label="Actions"></th></tr></thead><tbody>{employees.map(employee => (<tr key={employee.id}><td>{employee.name}</td><td>{employee.store || '-'}</td><td>{employee.position || '-'}</td><td><strong>{employee.active_points}</strong></td><td><span className={'badge ' + stageClass(employee.stage?.label)}>{employee.stage?.label}</span></td><td><button className="text-danger" onClick={() => deleteEmployee(employee.id)} type="button">Delete</button></td></tr>))}{employees.length === 0 && <tr><td colSpan="6" className="empty-row">No employees yet.</td></tr>}</tbody></table></div>
      </section>

      <section className="panel table-panel">
        <div className="panel-heading"><h2>Incident History</h2><p>Expired incidents remain visible but stop counting toward active points.</p></div>
        <div className="table-wrap"><table><thead><tr><th>Date</th><th>Employee</th><th>Type</th><th>Points</th><th>Expires</th><th>Notes</th><th aria-label="Actions"></th></tr></thead><tbody>{incidents.map(incident => (<tr key={incident.id} className={incident.active ? '' : 'expired'}><td>{formatDate(incident.incident_date)}</td><td>{incident.employee_name}</td><td>{incident.type_label}{!incident.active && <span className="expired-label">Expired</span>}</td><td>{incident.points}</td><td>{formatDate(incident.expires_at)}</td><td>{incident.notes || '-'}</td><td><button className="text-danger" onClick={() => deleteIncident(incident.id)} type="button">Delete</button></td></tr>))}{incidents.length === 0 && <tr><td colSpan="7" className="empty-row">No incidents yet.</td></tr>}</tbody></table></div>
      </section>
    </main>
  );
}
