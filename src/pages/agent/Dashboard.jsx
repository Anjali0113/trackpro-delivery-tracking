import React, { useState, useEffect } from 'react';
import axios from '../../api';
import { Link } from 'react-router-dom';
import { Navigation, Package, CheckCircle, Clock, MapPin, Truck } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import StatusTimeline from '../../components/StatusTimeline';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useSocketEvent } from '../../context/SocketContext';

const STATUS_ORDER = ['placed', 'picked', 'in-transit', 'delivered'];
const NEXT_STATUS = { placed: 'picked', picked: 'in-transit', 'in-transit': 'delivered' };
const NEXT_LABEL = { placed: 'Mark Picked Up', picked: 'Mark In Transit', 'in-transit': 'Mark Delivered' };
const STATUS_MAP = {
  placed: { label: 'Placed', class: 'badge-placed' },
  picked: { label: 'Picked Up', class: 'badge-picked' },
  'in-transit': { label: 'In Transit', class: 'badge-transit' },
  delivered: { label: 'Delivered', class: 'badge-delivered' },
};

export default function AgentDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [selected, setSelected] = useState(null);
  const { user } = useAuth();

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data);
      if (!selected && res.data.length > 0) setSelected(res.data[0]);
    } catch { toast.error('Failed to load deliveries'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);
  useSocketEvent('order:assigned', () => { fetchOrders(); });
  useSocketEvent('order:status', () => { fetchOrders(); });

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await axios.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
      if (selected?.id === orderId) setSelected(res.data);
      toast.success(`Status updated to ${newStatus}`);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update status'); }
    finally { setUpdating(null); }
  };

  const active = orders.filter(o => o.status !== 'delivered');
  const delivered = orders.filter(o => o.status === 'delivered');

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Deliveries" subtitle={`Logged in as ${user?.name}`} />
        <div className="page-content">

          {/* Stats */}
          <div className="grid grid-3 mb-24">
            {[
              { label: 'Total Assigned', value: orders.length, color: 'cyan', icon: Package },
              { label: 'Active', value: active.length, color: 'orange', icon: Truck },
              { label: 'Delivered', value: delivered.length, color: 'green', icon: CheckCircle },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className={`kpi-card ${color} fade-in`}>
                <div className="kpi-info">
                  <div className="kpi-label">{label}</div>
                  <div className={`kpi-value ${color}`}>{value}</div>
                </div>
                <div className={`kpi-icon ${color}`}><Icon size={24} /></div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

            {/* Orders List */}
            <div>
              <div className="page-header">
                <div className="page-title">Assigned <span>Deliveries</span></div>
              </div>

              {loading ? (
                <div className="loader"><div className="loader-spinner" /></div>
              ) : orders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📦</div>
                  <div className="empty-state-title">No deliveries assigned</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {orders.map(order => {
                    const st = STATUS_MAP[order.status];
                    const next = NEXT_STATUS[order.status];
                    return (
                      <div
                        key={order.id}
                        className={`order-card`}
                        style={{ cursor: 'pointer', border: selected?.id === order.id ? '1px solid rgba(0,212,255,0.4)' : undefined }}
                        onClick={() => setSelected(order)}
                      >
                        <div className="order-card-header">
                          <div className="order-id">{order.id}</div>
                          <span className={`badge ${st.class}`}>{st.label}</span>
                        </div>
                        <div className="order-meta">
                          <div className="order-meta-row"><MapPin size={12} />{order.pickupAddress}</div>
                          <div className="order-meta-row"><MapPin size={12} />{order.dropAddress}</div>
                          <div className="order-meta-row"><Package size={12} />{order.packageType} · {order.weight}</div>
                        </div>
                        {next && (
                          <div className="order-card-footer">
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={updating === order.id}
                              onClick={e => { e.stopPropagation(); updateStatus(order.id, next); }}
                            >
                              {updating === order.id ? 'Updating...' : NEXT_LABEL[order.status]}
                            </button>
                            <Link to={`/agent/navigate/${order.id}`} className="btn btn-cyan btn-sm" onClick={e => e.stopPropagation()}>
                              <Navigation size={12} /> Navigate
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order Detail */}
            {selected && (
              <div className="card" style={{ position: 'sticky', top: 80 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Order Timeline</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: 4 }}>{selected.id}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>{selected.customerName}</div>
                <StatusTimeline statusLogs={selected.statusLogs} currentStatus={selected.status} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
