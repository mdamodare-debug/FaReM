import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, ChevronRight, Edit2, Trash2, X } from 'lucide-react';

function TerritoryNode({ territory, depth = 0, onEdit, onDelete }) {
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
          <div className="flex items-center gap-1">
            <button 
              onClick={() => onEdit(territory)}
              className="p-1 hover:text-primary transition-colors cursor-pointer"
              title="Edit Territory"
            >
              <Edit2 size={14} />
            </button>
            <button 
              onClick={() => onDelete(territory)}
              className="p-1 hover:text-danger transition-colors cursor-pointer"
              title="Delete Territory"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
      {expanded && hasSubs && territory.sub_territories.map(sub => (
        <TerritoryNode key={sub.id} territory={sub} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default function TerritoryManagement() {
  const [territories, setTerritories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTerritory, setEditingTerritory] = useState(null);
  const [form, setForm] = useState({ name: '', parent_territory: '', status: 'Active' });
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

  const handleStartEdit = (t) => {
    setEditingTerritory(t);
    setForm({ 
      name: t.name, 
      parent_territory: t.parent_territory || '',
      status: t.status 
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (t) => {
    const message = t.farmer_count > 0 
      ? `This territory has ${t.farmer_count} farmers and sub-territories. Deleting it will reassign or remove access. Are you sure you want to permanently delete "${t.name}"?`
      : `Are you sure you want to permanently delete "${t.name}"?`;
      
    if (window.confirm(message)) {
      try {
        await api.deleteTerritory(t.id);
        fetchTerritories();
      } catch (err) {
        alert(err.error || 'Failed to delete territory. It might have active dependencies.');
      }
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.parent_territory) payload.parent_territory = null;

      if (editingTerritory) {
        await api.updateTerritory(editingTerritory.id, payload);
      } else {
        await api.createTerritory(payload);
      }
      
      setShowForm(false);
      setEditingTerritory(null);
      setForm({ name: '', parent_territory: '', status: 'Active' });
      fetchTerritories();
    } catch (err) { 
      alert(err.error || 'Failed to save territory');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-heading font-bold text-text">Territory Hierarchy</h2>
        <button onClick={() => {
          setEditingTerritory(null);
          setForm({ name: '', parent_territory: '', status: 'Active' });
          setShowForm(!showForm);
        }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium text-sm btn-press transition-colors">
          <Plus size={16} /> Add Territory
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6 animate-stagger-in border-2 border-primary/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading font-semibold text-text">
              {editingTerritory ? `Edit Territory: ${editingTerritory.name}` : 'Create New Territory'}
            </h3>
            <button 
              onClick={() => { setShowForm(false); setEditingTerritory(null); }}
              className="text-text-muted hover:text-text"
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-text-muted mb-1">Name</label>
              <input placeholder="Territory Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none" required />
            </div>
            
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-text-muted mb-1">Parent Territory</label>
              <select value={form.parent_territory} onChange={e => setForm({...form, parent_territory: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none">
                <option value="">-- Root (Region) --</option>
                {allTerritories
                  .filter(t => editingTerritory ? t.id !== editingTerritory.id : true)
                  .map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-semibold text-text-muted mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="col-span-1">
              <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium text-sm btn-press transition-colors">
                {editingTerritory ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card p-12 text-center text-text-muted">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p>Loading territories...</p>
        </div>
      ) : territories.length === 0 ? (
        <div className="card p-12 text-center text-text-muted bg-bg/50 border-dashed">
          No territories configured. Create your first region above to start building the hierarchy.
        </div>
      ) : (
        <div className="space-y-2">
          {territories.map(t => (
            <TerritoryNode key={t.id} territory={t} onEdit={handleStartEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
