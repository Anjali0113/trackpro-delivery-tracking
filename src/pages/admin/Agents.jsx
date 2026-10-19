import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Plus, X, Phone, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useSocketEvent } from '../../context/SocketContext';

function AddAgentModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', vehicleNo: '', password: 'agent123' });
  const [busy, setBusy] = useState(false);
  const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/api/auth/register', { ...form, role: 'agent' });
      toast.success('Agent added'); onAdded(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Could not add agent'); }
    finally { setBusy(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add Delivery Agent</div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="grid grid-2" style={{ gap: 16, marginBottom: 20 }}>
            {[['name', 'Full name', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'text'], ['vehicleNo', 'Vehicle no.', 'text']].map(([k, l, t]) => (
              <div className="form-group" key={k}>
                <label className="form-label">{l}</label>
                <input className="form-input" name={k} type={t} value={form[k]} onChange={set} required={k === 'name' || k === 'email'} />
              </div>
            ))}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Temporary password</label>
              <input className="form-input" name="password" value={form.password} onChange={set} minLength={6} required />
            </div>
          </div>
          <div className="flex gap-12">
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={busy}><Plus size={16} />{busy ? 'Adding…' : 'Add agent'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const load = useCallback(() => api.get('/api/agents').then((r) => setAgents(r.data)).finally(() => setLoading(false)), []);
  useEffect(() => { load(); }, [load]);
  useSocketEvent('order:status', load);
  useSocketEvent('order:assigned', load);
  useSocketEvent('user:new', load);

  const toggle = async (a) => {
    try { await api.patch(`/api/users/${a.id}/status`); toast.success(a.status === 'inactive' ? 'Agent activated' : 'Agent deactivated'); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const lastSeen = (loc) => {
    if (!loc?.timestamp) return 'No location yet';
    const m = Math.round((Date.now() - new Date(loc.timestamp)) / 60000);
    return m < 1 ? 'Just now' : m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`;
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Delivery Agents" subtitle={`${agents.length} agents · ${agents.filter((a) => a.activeOrders > 0).length} busy`} />
        <div className="page-content">
          <div className="page-header">
            <div className="page-title">Fleet <span>Overview</span></div>
            <button className="btn btn-primary" onClick={() => setAdding(true)}><Plus size={16} /> Add Agent</button>
          </div>

          {loading ? <div className="loader"><div className="loader-spinner" /></div> : (
            <div className="grid grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {agents.map((a) => (
                <div key={a.id} className="card fade-in" style={{ opacity: a.status === 'inactive' ? 0.55 : 1 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                    <div className="user-avatar" style={{ width: 46, height: 46 }}>{a.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{a.name}</div>
                      <div className="text-xs text-muted">{a.vehicleNo || 'No vehicle'}</div>
                    </div>
                    <span className={`badge ${a.status === 'inactive' ? 'badge-placed' : a.activeOrders ? 'badge-transit' : 'badge-delivered'}`}>
                      {a.status === 'inactive' ? 'Inactive' : a.activeOrders ? 'On delivery' : 'Available'}
                    </span>
                  </div>
                  <div className="grid grid-3" style={{ gap: 8, marginBottom: 16, textAlign: 'center' }}>
                    {[['Active', a.activeOrders], ['Completed', a.completedOrders], ['Last seen', lastSeen(a.location)]].map(([l, v]) => (
                      <div key={l}><div style={{ fontWeight: 700, fontSize: l === 'Last seen' ? 12 : 20 }}>{v}</div><div className="text-xs text-muted">{l}</div></div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="text-sm text-secondary"><Phone size={12} style={{ marginRight: 6 }} />{a.phone || '—'}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggle(a)}><Power size={12} />{a.status === 'inactive' ? 'Activate' : 'Deactivate'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {adding && <AddAgentModal onClose={() => setAdding(false)} onAdded={load} />}
    </div>
  );
}
