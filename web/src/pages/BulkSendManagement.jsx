import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function BulkSendManagement() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = async () => {
    try {
      const data = await api.getBulkSends();
      setBatches(Array.isArray(data) ? data : data.results || []);
    } catch { setBatches([]); }
    setLoading(false);
  };

  useEffect(() => { fetchBatches(); }, []);

  const handleApprove = async (id) => {
    if (!confirm('Approve this batch for sending?')) return;
    try {
      await api.approveBulkSend(id);
      fetchBatches();
    } catch { /* handled */ }
  };

  const handleReject = async (id) => {
    if (!confirm('Reject this batch?')) return;
    try {
      await api.rejectBulkSend(id);
      fetchBatches();
    } catch { /* handled */ }
  };

  const statusIcon = (s) => {
    if (s === 'Approved') return <CheckCircle size={14} className="text-success" />;
    if (s === 'Rejected') return <XCircle size={14} className="text-danger" />;
    return <Clock size={14} className="text-warning" />;
  };

  const statusBadge = (s) => {
    if (s === 'Approved') return 'badge-active';
    if (s === 'Rejected') return 'badge-inactive';
    return 'badge-pending';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-heading font-bold text-text">Bulk Message Management</h2>
        <p className="text-sm text-text-muted mt-1">Review and approve bulk message batches submitted by field staff and managers.</p>
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Created</th>
              <th>Channel</th>
              <th>Recipients</th>
              <th>Approval</th>
              <th>Send Status</th>
              <th>Sent / Failed</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-8 text-text-muted">Loading...</td></tr>
            ) : batches.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-8 text-text-muted">No bulk send batches found.</td></tr>
            ) : batches.map((batch, i) => (
              <tr key={batch.id} className="animate-stagger-in" style={{ animationDelay: `${i * 60}ms` }}>
                <td className="text-xs font-mono">{new Date(batch.created_at).toLocaleDateString('en-IN')}</td>
                <td><span className={`badge ${batch.channel === 'WhatsApp' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>{batch.channel}</span></td>
                <td className="font-mono">{batch.recipient_count}</td>
                <td>
                  <span className={`badge ${statusBadge(batch.approval_status)} flex items-center gap-1 w-fit`}>
                    {statusIcon(batch.approval_status)} {batch.approval_status}
                  </span>
                </td>
                <td className="text-xs">{batch.send_status}</td>
                <td className="font-mono text-xs">
                  <span className="text-success">{batch.sent_count}</span> / <span className="text-danger">{batch.failed_count}</span>
                </td>
                <td className="text-right">
                  {batch.approval_status === 'Pending' && (
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleApprove(batch.id)}
                        className="text-xs bg-success/10 text-success hover:bg-success/20 px-3 py-1.5 rounded-md font-medium transition-colors">
                        Approve
                      </button>
                      <button onClick={() => handleReject(batch.id)}
                        className="text-xs bg-danger/10 text-danger hover:bg-danger/20 px-3 py-1.5 rounded-md font-medium transition-colors">
                        Reject
                      </button>
                    </div>
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
