import React, { useState, useEffect } from 'react';
import axios from '../api';
import { X, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AssignAgentModal({ order, onClose, onAssigned }) {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/agents').then(r => setAgents(r.data));
  }, []);

  const handleAssign = async () => {
    if (!selectedAgent) { toast.error('Select an agent'); return; }
    setLoading(true);
    try {
      await axios.post(`/api/orders/${order.id}/assign`, { agentId: selectedAgent });
      toast.success('Agent assigned successfully!');
      onAssigned();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to assign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Assign Delivery Agent</div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div className="text-sm text-secondary" style={{ marginBottom: 4 }}>Order ID</div>
          <div className="font-bold">{order.id}</div>
          <div className="text-sm text-muted" style={{ marginTop: 4 }}>{order.pickupAddress} → {order.dropAddress}</div>
        </div>

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Select Agent</label>
          <select className="form-select" value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)}>
            <option value="">Choose a delivery agent...</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} — {a.vehicleNo || 'N/A'} ({a.activeOrders} active orders)
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-12">
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAssign} disabled={loading}>
            <Truck size={16} />
            {loading ? 'Assigning...' : 'Assign Agent'}
          </button>
        </div>
      </div>
    </div>
  );
}
