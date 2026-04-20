import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, ChevronRight } from 'lucide-react';

function TerritoryNode({ territory, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasSubs = territory.sub_territories && territory.sub_territories.length > 0;

  return (
    <div style={{ marginLeft: depth * 20 }}>
      <div className={`flex items-center justify-between px-4 py-3 rounded-lg mb-1 transition-colors ${depth === 0 ? 'bg-surface border border-border' : 'hover:bg-bg'}`}>
        <div className="flex items-center gap-2">
          {hasSubs && (
            <button onClick={() => setExpanded(!expanded)} className="text-text-muted hover:text-text">
              <ChevronRight size={14} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
          )}
          {!hasSubs && <span className="w-3.5" />}
          <span className={`text-sm ${depth === 0 ? 'font-heading font-semibold' : 'font-medium'}`}>{territory.name}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span>{territory.farmer_count} farmers</span>
          <span className={`badge ${territory.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{territory.status}</span>
        </div>
      </div>
      {expanded && hasSubs && territory.sub_territories.map(sub => (
        <TerritoryNode key={sub.id} territory={sub} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function TerritoryManagement() {
  const [territories, setTerritories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', parent_territory: '' });
  const [allTerritories, setAllTerritories] = useState([]);

  const fetchTerritories = async () => {
    try {
      const data = await api.getTerritories();
      const list = Array.isArray(data) ? data : data.results || [];
      setAllTerritories(list);
      setTerritories(list.filter(t => !t.parent_territory));
    } catch { setTerritories([]); }
    setLoading(false);
  };

  useEffect(() => { fetchTerritories(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.parent_territory) delete payload.parent_territory;
      await api.createTerritory(payload);
      setShowForm(false);
      setForm({ name: '', parent_territory: '' });
      fetchTerritories();
    } catch { /* handled */ }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-heading font-bold text-text">Territory Hierarchy</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium text-sm btn-press">
          <Plus size={16} /> Add Territory
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6 animate-stagger-in">
          <form onSubmit={handleCreate} className="grid grid-cols-3 gap-4">
            <input placeholder="Territory Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none" required />
            <select value={form.parent_territory} onChange={e => setForm({...form, parent_territory: e.target.value})}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="">-- Root (Region) --</option>
              {allTerritories.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium text-sm btn-press">Create</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center text-text-muted">Loading territories...</div>
      ) : territories.length === 0 ? (
        <div className="card p-8 text-center text-text-muted">No territories configured. Create your first region above.</div>
      ) : (
        <div className="space-y-2">
          {territories.map(t => <TerritoryNode key={t.id} territory={t} />)}
        </div>
      )}
    </div>
  );
}
