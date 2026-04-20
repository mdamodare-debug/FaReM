import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Shield } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.getAuditLogs();
        setLogs(Array.isArray(data) ? data : data.results || []);
      } catch { setLogs([]); }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const filtered = logs.filter(l =>
    l.entity_type?.toLowerCase().includes(search.toLowerCase()) ||
    l.action_type?.toLowerCase().includes(search.toLowerCase()) ||
    l.entity_id?.includes(search)
  );

  const actionColors = {
    Create: 'bg-green-50 text-green-700',
    Update: 'bg-blue-50 text-blue-700',
    Delete: 'bg-red-50 text-red-700',
    Export: 'bg-purple-50 text-purple-700',
    Login: 'bg-amber-50 text-amber-700',
    Logout: 'bg-gray-100 text-gray-700',
    BulkImport: 'bg-indigo-50 text-indigo-700',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Shield size={20} className="text-primary" />
          <h2 className="text-xl font-heading font-bold text-text">System Audit Logs</h2>
        </div>
        <span className="text-xs text-text-muted">{filtered.length} entries</span>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" placeholder="Filter by entity type, action, or ID..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none" />
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Entity ID</th>
              <th>Field</th>
              <th>Old Value</th>
              <th>New Value</th>
              <th>User ID</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center py-8 text-text-muted">Loading audit logs...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-8 text-text-muted">No audit logs found.</td></tr>
            ) : filtered.slice(0, 200).map((log, i) => (
              <tr key={log.id} className="animate-stagger-in" style={{ animationDelay: `${Math.min(i * 20, 300)}ms` }}>
                <td className="font-mono text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                <td><span className={`badge ${actionColors[log.action_type] || 'bg-gray-100 text-gray-700'}`}>{log.action_type}</span></td>
                <td className="font-medium text-xs">{log.entity_type}</td>
                <td className="font-mono text-xs max-w-[120px] truncate">{log.entity_id}</td>
                <td className="text-xs">{log.field_changed || '—'}</td>
                <td className="text-xs max-w-[150px] truncate text-text-muted">{log.old_value || '—'}</td>
                <td className="text-xs max-w-[150px] truncate">{log.new_value || '—'}</td>
                <td className="font-mono text-xs max-w-[100px] truncate">{log.user_id || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 200 && <p className="text-center text-xs text-text-muted py-3">Showing first 200 of {filtered.length} entries</p>}
      </div>
    </div>
  );
}
