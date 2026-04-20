import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, X } from 'lucide-react';

export default function PromotionLibrary() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content_type: 'Image', file_url: '', language_tags: ['English'], expiry_date: '' });

  const fetchPromos = async () => {
    try {
      const data = await api.getPromotions();
      setPromos(Array.isArray(data) ? data : data.results || []);
    } catch { setPromos([]); }
    setLoading(false);
  };

  useEffect(() => { fetchPromos(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.expiry_date) delete payload.expiry_date;
      await api.createPromotion(payload);
      setShowForm(false);
      setForm({ title: '', content_type: 'Image', file_url: '', language_tags: ['English'], expiry_date: '' });
      fetchPromos();
    } catch { /* handled */ }
  };

  const typeIcons = { Video: '🎬', Image: '🖼️', PDF: '📄', Link: '🔗' };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-heading font-bold text-text">Promotion Library</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium text-sm btn-press">
          <Plus size={16} /> Add Content
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6 animate-stagger-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading font-semibold">New Content Item</h3>
            <button onClick={() => setShowForm(false)}><X size={18} className="text-text-muted" /></button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none" required />
            <select value={form.content_type} onChange={e => setForm({...form, content_type: e.target.value})}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="Image">Image</option><option value="Video">Video</option>
              <option value="PDF">PDF</option><option value="Link">Link</option>
            </select>
            <input placeholder="File/Content URL" value={form.file_url} onChange={e => setForm({...form, file_url: e.target.value})}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-surface font-mono focus:ring-2 focus:ring-primary focus:outline-none col-span-2" required />
            <input type="date" placeholder="Expiry Date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none" />
            <div className="flex justify-end items-end">
              <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium text-sm btn-press">Create</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 card p-8 text-center text-text-muted">Loading...</div>
        ) : promos.length === 0 ? (
          <div className="col-span-3 card p-8 text-center text-text-muted">No content in library.</div>
        ) : promos.map((promo, i) => (
          <div key={promo.id} className="card p-4 animate-stagger-in" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{typeIcons[promo.content_type] || '📎'}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-text truncate">{promo.title}</h4>
                <p className="text-xs text-text-muted mt-1 font-mono truncate">{promo.file_url}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="badge bg-blue-50 text-blue-700">{promo.content_type}</span>
                  <span className={`badge ${promo.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{promo.status}</span>
                  {promo.expiry_date && <span className="text-xs text-text-muted">Expires: {promo.expiry_date}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
