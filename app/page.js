
'use client';

import { useEffect, useMemo, useState } from 'react';

const incidentTypes = [
  ['missed_punches', '3 Missed Punches / Pay Period = 0.5'],
  ['late_under_10', 'Late < 10 Minutes = 0.25'],
  ['late_over_10', 'Late > 10 Minutes = 0.5'],
  ['absence', 'Absence = 1'],
  ['monday_absence', 'Monday Absence = 2']
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [employees, setEmployees] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState('');
  const [employeeForm, setEmployeeForm] = useState({ name: '', store: '', position: '', status: 'Active' });
  const [incidentForm, setIncidentForm] = useState({ employee_id: '', type: 'late_under_10', incident_date: today(), pay_period: '', notes: '' });

  useEffect(() => {
    if (localStorage.getItem('attendanceAuth') === 'yes') {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed]);

  async function login(e) {
    e.preventDefault();
    const expected = process.env.NEXT_PUBLIC_APP_PASSWORD || 'ChangeMe123!';
    if (password === expected) {
      localStorage.setItem('attendanceAuth', 'yes');
      setAuthed(true);
    } else {
      setError('Invalid password');
    }
  }

  async function loadData() {
    setError('');
    const res = await fetch('/api/data');
    if (!res.ok) {
      const text = await res.text();
      setError('Failed to load data. Make sure DATABASE_URL is set in Vercel. ' + text);
      return;
    }
    const data = await res.json();
    setEmployees(data.employees || []);
    setIncidents(data.incidents || []);
  }

  async function addEmployee(e) {
    e.preventDefault();
    await fetch('/api/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(employeeForm) });
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
    await fetch('/api/incidents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(incidentForm) });
    setIncidentForm({ employee_id: '', type: 'late_under_10', incident_date: today(), pay_period: '', notes: '' });
    loadData();
  }

  async function deleteIncident(id) {
    if (!confirm('Delete this incident entry?')) return;
    await fetch('/api/incidents/' + id, { method: 'DELETE' });
    loadData();
  }

  const activeIncidents = useMemo(() => incidents.filter(i => i.active), [incidents]);

  if (!authed) {
    return (
      <main className="container">
        <div className="card" style={{ maxWidth: 420, margin: '80px auto' }}>
          <h1>Time & Attendance Tracker</h1>
          <p className="small">Default password: ChangeMe123! Set NEXT_PUBLIC_APP_PASSWORD in Vercel to change it.</p>
          <form onSubmit={login}>
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', marginBottom: 12 }} />
            <button type="submit">Log In</button>
          </form>
          {error && <p className="small" style={{ color: 'red' }}>{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="nav">
        <div>
          <h1>Time & Attendance Tracker</h1>
          <div className="small">3 = Verbal | 6 = Write Up | 12 = Separation Review</div>
        </div>
        <button className="secondary" onClick={() => { localStorage.removeItem('attendanceAuth'); location.reload(); }}>Log Out</button>
      </div>

      {error && <div className="card" style={{ borderColor: 'red', color: 'red' }}>{error}</div>}

      <section className="card">
        <h2>Add Employee</h2>
        <form onSubmit={addEmployee} className="row">
          <input placeholder="Employee name" value={employeeForm.name} onChange={e => setEmployeeForm({ ...employeeForm, name: e.target.value })} required />
          <input placeholder="Store" value={employeeForm.store} onChange={e => setEmployeeForm({ ...employeeForm, store: e.target.value })} />
          <input placeholder="Position" value={employeeForm.position} onChange={e => setEmployeeForm({ ...employeeForm, position: e.target.value })} />
          <select value={employeeForm.status} onChange={e => setEmployeeForm({ ...employeeForm, status: e.target.value })}>
            <option>Active</option>
            <option>Inactive</option>
            <option>Separated</option>
          </select>
          <button>Add Employee</button>
        </form>
      </section>

      <section className="card">
        <h2>Employees</h2>
        <table>
          <thead><tr><th>Name</th><th>Store</th><th>Position</th><th>Active Points</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {employees.map(e => (
              <tr key={e.id}>
                <td>{e.name}</td>
                <td>{e.store}</td>
                <td>{e.position}</td>
                <td>{e.active_points}</td>
                <td><span className={'badge ' + e.stage.color}>{e.stage.label}</span></td>
                <td><button className="danger" onClick={() => deleteEmployee(e.id)}>Delete</button></td>
              </tr>
            ))}
            {employees.length === 0 && <tr><td colSpan="6">No employees yet.</td></tr>}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>Add Incident</h2>
        <form onSubmit={addIncident}>
          <div className="row" style={{ marginBottom: 12 }}>
            <select required value={incidentForm.employee_id} onChange={e => setIncidentForm({ ...incidentForm, employee_id: e.target.value })}>
              <option value="">Select employee</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <select value={incidentForm.type} onChange={e => setIncidentForm({ ...incidentForm, type: e.target.value })}>
              {incidentTypes.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input type="date" value={incidentForm.incident_date} onChange={e => setIncidentForm({ ...incidentForm, incident_date: e.target.value })} required />
            <input placeholder="Pay period, optional" value={incidentForm.pay_period} onChange={e => setIncidentForm({ ...incidentForm, pay_period: e.target.value })} />
          </div>
          <textarea placeholder="Notes" value={incidentForm.notes} onChange={e => setIncidentForm({ ...incidentForm, notes: e.target.value })} />
          <div style={{ marginTop: 12 }}><button>Add Incident</button></div>
        </form>
      </section>

      <section className="card">
        <h2>Incident History</h2>
        <table>
          <thead><tr><th>Date</th><th>Employee</th><th>Type</th><th>Points</th><th>Expires</th><th>Notes</th><th></th></tr></thead>
          <tbody>
            {incidents.map(i => (
              <tr key={i.id} style={{ opacity: i.active ? 1 : .55 }}>
                <td>{String(i.incident_date).slice(0,10)}</td>
                <td>{i.employee_name}</td>
                <td>{i.type_label}{!i.active && <div className="small">Expired</div>}</td>
                <td>{i.points}</td>
                <td>{String(i.expires_at).slice(0,10)}</td>
                <td>{i.notes}</td>
                <td><button className="danger" onClick={() => deleteIncident(i.id)}>Delete</button></td>
              </tr>
            ))}
            {incidents.length === 0 && <tr><td colSpan="7">No incidents yet.</td></tr>}
          </tbody>
        </table>
      </section>
    </main>
  );
}
