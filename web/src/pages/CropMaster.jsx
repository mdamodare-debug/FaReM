import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function CropMaster() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedCrop, setExpandedCrop] = useState(null);
  const [form, setForm] = useState({ crop_name: '', crop_category: '', scientific_name: '' });
  const [stageForm, setStageForm] = useState({ crop: '', stage_name: '', sequence_number: 1, days_from_previous_stage: 0, stage_description: '' });
  const [varietyForm, setVarietyForm] = useState({ crop: '', variety_name: '', typical_duration_days: '' });
  const [showStageForm, setShowStageForm] = useState(null);
  const [showVarietyForm, setShowVarietyForm] = useState(null);

  const fetchCrops = async () => {
    try {
      const data = await api.getCrops();
      setCrops(Array.isArray(data) ? data : data.results || []);
    } catch { setCrops([]); }
    setLoading(false);
  };

  useEffect(() => { fetchCrops(); }, []);

  const handleCreateCrop = async (e) => {
    e.preventDefault();
    try {
      await api.createCrop(form);
      setShowForm(false);
      setForm({ crop_name: '', crop_category: '', scientific_name: '' });
      fetchCrops();
    } catch { /* handled */ }
  };

  const handleCreateStage = async (e) => {
    e.preventDefault();
    try {
      await api.createStage(stageForm);
      setShowStageForm(null);
      setStageForm({ crop: '', stage_name: '', sequence_number: 1, days_from_previous_stage: 0, stage_description: '' });
      fetchCrops();
    } catch { /* handled */ }
  };

  const handleCreateVariety = async (e) => {
    e.preventDefault();
    try {
      await api.createVariety(varietyForm);
      setShowVarietyForm(null);
      setVarietyForm({ crop: '', variety_name: '', typical_duration_days: '' });
      fetchCrops();
    } catch { /* handled */ }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-heading font-bold text-text">Crop Master Configuration</h2>
        <button id="add-crop-btn" onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors btn-press">
          <Plus size={16} /> Add Crop
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6 animate-stagger-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading font-semibold">New Crop</h3>
            <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text"><X size={18} /></button>
          </div>
          <form onSubmit={handleCreateCrop} className="grid grid-cols-3 gap-4">
            <input placeholder="Crop Name" value={form.crop_name} onChange={e => setForm({...form, crop_name: e.target.value})}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none" required />
            <input placeholder="Category" value={form.crop_category} onChange={e => setForm({...form, crop_category: e.target.value})}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none" required />
            <input placeholder="Scientific Name" value={form.scientific_name} onChange={e => setForm({...form, scientific_name: e.target.value})}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary focus:outline-none" />
            <div className="col-span-3 flex justify-end">
              <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium text-sm btn-press">Create Crop</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="card p-8 text-center text-text-muted">Loading crops...</div>
        ) : crops.length === 0 ? (
          <div className="card p-8 text-center text-text-muted">No crops configured. Add your first crop above.</div>
        ) : crops.map((crop, i) => (
          <div key={crop.id} className="card animate-stagger-in" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between px-5 py-4 cursor-pointer" onClick={() => setExpandedCrop(expandedCrop === crop.id ? null : crop.id)}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <span className="text-primary text-lg">🌾</span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-text">{crop.crop_name}</h3>
                  <p className="text-xs text-text-muted">{crop.scientific_name && <em>{crop.scientific_name}</em>} · {crop.crop_category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <span>{crop.stages?.length || 0} stages</span>
                <span>{crop.varieties?.length || 0} varieties</span>
                {expandedCrop === crop.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {expandedCrop === crop.id && (
              <div className="border-t border-border px-5 py-4 bg-bg/50">
                {/* Stages */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-heading font-semibold text-text-muted uppercase tracking-wide">Growth Stages</h4>
                    <button onClick={() => { setShowStageForm(crop.id); setStageForm({...stageForm, crop: crop.id}); }}
                      className="text-xs text-primary hover:text-primary-dark font-medium">+ Add Stage</button>
                  </div>
                  {crop.stages?.length > 0 ? (
                    <div className="space-y-1">
                      {crop.stages.sort((a,b) => a.sequence_number - b.sequence_number).map(stage => (
                        <div key={stage.id} className="flex items-center gap-3 bg-surface rounded px-3 py-2 text-sm">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{stage.sequence_number}</span>
                          <span className="font-medium">{stage.stage_name}</span>
                          <span className="text-text-muted text-xs">+{stage.days_from_previous_stage} days</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-text-muted">No stages configured.</p>}
                  {showStageForm === crop.id && (
                    <form onSubmit={handleCreateStage} className="grid grid-cols-4 gap-2 mt-3">
                      <input placeholder="Stage Name" value={stageForm.stage_name} onChange={e => setStageForm({...stageForm, stage_name: e.target.value})}
                        className="px-2 py-1.5 border border-border rounded text-sm bg-surface" required />
                      <input type="number" placeholder="Seq #" value={stageForm.sequence_number} onChange={e => setStageForm({...stageForm, sequence_number: parseInt(e.target.value)})}
                        className="px-2 py-1.5 border border-border rounded text-sm bg-surface" required />
                      <input type="number" placeholder="Days from prev" value={stageForm.days_from_previous_stage} onChange={e => setStageForm({...stageForm, days_from_previous_stage: parseInt(e.target.value)})}
                        className="px-2 py-1.5 border border-border rounded text-sm bg-surface" required />
                      <button type="submit" className="bg-primary text-white px-3 py-1.5 rounded text-sm font-medium btn-press">Add</button>
                    </form>
                  )}
                </div>

                {/* Varieties */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-heading font-semibold text-text-muted uppercase tracking-wide">Varieties</h4>
                    <button onClick={() => { setShowVarietyForm(crop.id); setVarietyForm({...varietyForm, crop: crop.id}); }}
                      className="text-xs text-primary hover:text-primary-dark font-medium">+ Add Variety</button>
                  </div>
                  {crop.varieties?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {crop.varieties.map(v => (
                        <span key={v.id} className="badge bg-amber-50 text-amber-800">{v.variety_name} {v.typical_duration_days && `· ${v.typical_duration_days}d`}</span>
                      ))}
                    </div>
                  ) : <p className="text-xs text-text-muted">No varieties configured.</p>}
                  {showVarietyForm === crop.id && (
                    <form onSubmit={handleCreateVariety} className="grid grid-cols-3 gap-2 mt-3">
                      <input placeholder="Variety Name" value={varietyForm.variety_name} onChange={e => setVarietyForm({...varietyForm, variety_name: e.target.value})}
                        className="px-2 py-1.5 border border-border rounded text-sm bg-surface" required />
                      <input type="number" placeholder="Duration (days)" value={varietyForm.typical_duration_days} onChange={e => setVarietyForm({...varietyForm, typical_duration_days: parseInt(e.target.value)})}
                        className="px-2 py-1.5 border border-border rounded text-sm bg-surface" />
                      <button type="submit" className="bg-primary text-white px-3 py-1.5 rounded text-sm font-medium btn-press">Add</button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
