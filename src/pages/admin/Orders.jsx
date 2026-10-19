import React, { useState, useEffect } from 'react';
import axios from '../../api';
import { Search, Package, Truck, Filter, RefreshCw } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import AssignAgentModal from '../../components/AssignAgentModal';
import toast from 'react-hot-toast';
import { useSocketEvent } from '../../context/SocketContext';

const STATUS_CLASS = {
  placed: 'badge-placed', picked: 'badge-picked', 'in-transit': 'badge-transit', delivered: 'badge-delivered'
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(null);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data);
      setFiltered(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);
  useSocketEvent('order:new', fetchOrders);
  useSocketEvent('order:status', fetchOrders);
  useSocketEvent('order:assigned', fetchOrders);

  useEffect(() => {
    let result = orders;
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter);
    if (search) result = result.filter(o =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (o.agentName || '').toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, statusFilter, orders]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await axios.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
      toast.success('Status updated');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update'); }
    finally { setUpdating(null); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Order Management" subtitle={`${orders.length} total orders`} />
        <div className="page-content">

          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div className="search-box" style={{ flex: 1, minWidth: 240 }}>
              <Search size={16} />
              <input placeholder="Search by order ID, customer, agent..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="placed">Placed</option>
              <option value="picked">Picked</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
            <button className="btn btn-ghost" onClick={fetchOrders}><RefreshCw size={16} /></button>
          </div>

          {loading ? (
            <div className="loader"><div className="loader-spinner" /></div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Route</th>
                      <th>Package</th>
                      <th>Agent</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(order => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{order.id}</td>
                        <td>{order.customerName}</td>
                        <td style={{ maxWidth: 180 }}>
                          <div style={{ fontSize: 12 }}>{order.pickupAddress.slice(0, 30)}...</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.dropAddress.slice(0, 30)}...</div>
                        </td>
                        <td><div>{order.packageType}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.weight}</div></td>
                        <td>
                          {order.agentName || (
                            <button className="btn btn-ghost btn-sm" onClick={() => setAssignModal(order)}>
                              <Truck size={12} /> Assign
                            </button>
                          )}
                        </td>
                        <td>
                          <select
                            className="form-select"
                            style={{ padding: '4px 8px', fontSize: 12, width: 120 }}
                            value={order.status}
                            onChange={e => updateStatus(order.id, e.target.value)}
                            disabled={updating === order.id || !order.agentId}
                            title={!order.agentId ? 'Assign an agent first' : ''}
                          >
                            <option value="placed">Placed</option>
                            <option value="picked">Picked</option>
                            <option value="in-transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </td>
                        <td style={{ fontSize: 12 }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                          {!order.agentId && (
                            <button className="btn btn-primary btn-sm" onClick={() => setAssignModal(order)}>
                              Assign Agent
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      {assignModal && (
        <AssignAgentModal
          order={assignModal}
          onClose={() => setAssignModal(null)}
          onAssigned={fetchOrders}
        />
      )}
    </div>
  );
}
