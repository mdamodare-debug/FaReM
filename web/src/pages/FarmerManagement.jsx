import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Plus, Upload, Search } from 'lucide-react';
import ImportWizard from '../components/ImportWizard';

export default function FarmerManagement() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [showWizard, setShowWizard] = useState(false);

  const fetchFarmers = async () => {
    try {
      const data = await api.getFarmers();
      setFarmers(Array.isArray(data) ? data : data.results || []);
    } catch { setFarmers([]); }
    setLoading(false);
  };

  useEffect(() => { fetchFarmers(); }, []);

  const filtered = farmers.filter(f =>
    f.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.village?.toLowerCase().includes(search.toLowerCase()) ||
    f.primary_mobile?.includes(search) ||
    f.assigned_staff_mobile?.includes(search)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-heading font-bold text-text">Farmer Management</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-4 py-2 rounded-lg font-medium text-sm cursor-pointer btn-press transition-colors"
          >
            <Upload size={16} />
            Bulk Import Excel
          </button>
        </div>
      </div>

      {showWizard && (
        <ImportWizard 
          onClose={() => setShowWizard(false)} 
          onComplete={fetchFarmers} 
        />
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text" placeholder="Search by name, village, or mobile..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Mobile</th>
              <th>Village</th>
              <th>District</th>
              <th>Source</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-8 text-text-muted">Loading farmers...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-text-muted">No farmers found.</td></tr>
            ) : filtered.slice(0, 100).map((farmer, i) => (
              <tr key={farmer.id} className="animate-stagger-in" style={{ animationDelay: `${i * 30}ms` }}>
                <td className="font-medium">{farmer.full_name}</td>
                <td className="font-mono text-xs">{farmer.primary_mobile}</td>
                <td>{farmer.village}</td>
                <td>{farmer.district || '—'}</td>
                <td><span className={`badge ${farmer.source === 'BulkImport' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>{farmer.source}</span></td>
                <td><span className={`badge ${farmer.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{farmer.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 100 && <p className="text-center text-xs text-text-muted py-3">Showing first 100 of {filtered.length} results</p>}
      </div>
    </div>
  );
}
