import React, { useState, useEffect } from 'react';
import { Search, Star, MapPin, Package } from 'lucide-react';
import api from '../../api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import RatingModal from '../../components/RatingModal';
import { useSocketEvent } from '../../context/SocketContext';

export default function History() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [rate, setRate] = useState(null);

  const load = () => api.get('/api/orders').then((r) => setOrders(r.data.filter((o) => o.status === 'delivered'))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  useSocketEvent('order:status', load);

  const list = orders.filter((o) => `${o.id} ${o.pickupAddress} ${o.dropAddress} ${o.packageType}`.toLowerCase().includes(q.toLowerCase()));
  const mins = (o) => Math.round((new Date(o.deliveredAt) - new Date(o.createdAt)) / 60000);
  const fmt = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Delivery History" subtitle={`${orders.length} completed deliveries`} />
        <div className="page-content">
          <div className="search-box" style={{ marginBottom: 20 }}>
            <Search size={16} />
            <input placeholder="Search by order ID, address or package…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {loading ? <div className="loader"><div className="loader-spinner" /></div> : list.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">🧾</div><div className="empty-state-title">No completed deliveries yet</div></div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Order</th><th>Route</th><th>Package</th><th>Agent</th><th>Delivered</th><th>Time taken</th><th>Rating</th></tr></thead>
                  <tbody>
                    {list.map((o) => (
                      <tr key={o.id}>
                        <td style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{o.id}</td>
                        <td style={{ fontSize: 12 }}><div><MapPin size={11} /> {o.pickupAddress}</div><div className="text-muted">→ {o.dropAddress}</div></td>
                        <td><Package size={12} /> {o.packageType}<div className="text-xs text-muted">{o.weight}</div></td>
                        <td>{o.agentName || '—'}</td>
                        <td style={{ fontSize: 12 }}>{new Date(o.deliveredAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                        <td>{fmt(mins(o))}</td>
                        <td>
                          {o.rating ? <span className="text-orange"><Star size={12} fill="currentColor" /> {o.rating}/5</span>
                            : <button className="btn btn-ghost btn-sm" onClick={() => setRate(o)}>Rate</button>}
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
      {rate && <RatingModal order={rate} onClose={() => setRate(null)} onRated={load} />}
    </div>
  );
}
