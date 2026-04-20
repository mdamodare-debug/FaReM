import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, X } from 'lucide-react';

export default function UserMaster() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [territories, setTerritories] = useState([]);
  const [form, setForm] = useState({ mobile_number: '', first_name: '', last_name: '', employee_id: '', role: 'FieldStaff', territory: '', reporting_manager: '' });
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(Array.isArray(data) ? data : data.results || []);
    } catch { setUsers([]); }
    setLoading(false);
  };

  const fetchTerritories = async () => {
    try {
      const data = await api.getTerritories();
      setTerritories(Array.isArray(data) ? data : data.results || []);
    } catch { setTerritories([]); }
  };

  useEffect(() => { fetchUsers(); fetchTerritories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, username: form.mobile_number };
      if (!payload.territory) delete payload.territory;
      if (!payload.reporting_manager) delete payload.reporting_manager;
      await api.createUser(payload);
      setShowForm(false);
      setForm({ mobile_number: '', first_name: '', last_name: '', employee_id: '', role: 'FieldStaff', territory: '', reporting_manager: '' });
      fetchUsers();
    } catch (err) {
      setError(err.error || err.mobile_number?.[0] || 'Failed to create user');
    }
  };

  const handleDisable = async (id) => {
    if (!confirm('Disable this user? They will not be able to log in.')) return;
    try {
      await api.deleteUser(id);
      fetchUsers();
    } catch { /* already handled */ }
  };

  const roleColors = {
    FieldStaff: 'bg-blue-100 text-blue-800',
    TerritoryManager: 'bg-purple-100 text-purple-800',
    ZonalManager: 'bg-indigo-100 text-indigo-800',
    Admin: 'bg-green-100 text-green-800',
    ContentTeam: 'bg-orange-100 text-orange-800',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-heading font-bold text-text">User Management</h2>
        <button id="add-user-btn" onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors btn-press">
          <Plus size={16} /> Add User
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6 animate-stagger-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading font-semibold text-text">New User</h3>
            <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text"><X size={18} /></button>
          </div>
          {error && <div className="bg-red-50 text-danger text-sm px-3 py-2 rounded mb-3">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input placeholder="First Name" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none" required />
            <input placeholder="Last Name" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none" />
            <input placeholder="Mobile Number" value={form.mobile_number} onChange={e => setForm({...form, mobile_number: e.target.value})}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-surface font-mono focus:ring-2 focus:ring-primary focus:outline-none" required />
            <input placeholder="Employee ID" value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none" />
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="FieldStaff">Field Staff</option>
              <option value="TerritoryManager">Territory Manager</option>
              <option value="ZonalManager">Zonal Manager</option>
              <option value="Admin">Admin</option>
              <option value="ContentTeam">Content Team</option>
            </select>
            <select value={form.territory} onChange={e => setForm({...form, territory: e.target.value})}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="">-- Select Territory --</option>
              {territories.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <div className="col-span-2 flex justify-end">
              <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors btn-press">
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Role</th>
              <th>Territory</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-8 text-text-muted">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-8 text-text-muted">No users found. Add your first user above.</td></tr>
            ) : users.map((user, i) => (
              <tr key={user.id} className="animate-stagger-in" style={{ animationDelay: `${i * 60}ms` }}>
                <td className="font-mono text-xs">{user.employee_id || '—'}</td>
                <td className="font-medium">{user.first_name} {user.last_name}</td>
                <td className="font-mono text-xs">{user.mobile_number}</td>
                <td><span className={`badge ${roleColors[user.role] || ''}`}>{user.role}</span></td>
                <td>{user.territory_name || '—'}</td>
                <td><span className={`badge ${user.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{user.status}</span></td>
                <td className="text-right">
                  {user.status === 'Active' && (
                    <button onClick={() => handleDisable(user.id)} className="text-xs text-danger hover:text-red-700 font-medium transition-colors">
                      Disable
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
