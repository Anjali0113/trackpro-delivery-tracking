import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import LiveMap from '../../components/LiveMap';
import StatusTimeline from '../../components/StatusTimeline';
import RatingModal from '../../components/RatingModal';
import { useSocket, useSocketEvent } from '../../context/SocketContext';

const STATUS_MAP = {
  placed: { label: 'Placed', class: 'badge-placed' },
  picked: { label: 'Picked Up', class: 'badge-picked' },
  'in-transit': { label: 'In Transit', class: 'badge-transit' },
  delivered: { label: 'Delivered', class: 'badge-delivered' },
};

export default function TrackOrder() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(false);
  const { joinOrderRoom, socket } = useSocket();

  const fetchOrder = () => api.get(`/api/orders/${orderId}`)
    .then((r) => setOrder(r.data))
    .catch((e) => setError(e.response?.data?.message || 'Order not found'))
    .finally(() => setLoading(false));

  useEffect(() => { fetchOrder(); }, [orderId]); // eslint-disable-line
  useEffect(() => { if (socket) joinOrderRoom(orderId); }, [socket, orderId, joinOrderRoom]);
  useSocketEvent('order:status', (d) => { if (d.orderId === orderId) fetchOrder(); });
  useSocketEvent('order:assigned', (d) => { if (d.orderId === orderId) fetchOrder(); });

  if (loading) return <div className="loader"><div className="loader-spinner" /></div>;
  if (!order) return <div style={{ padding: 32, color: 'var(--text-muted)' }}>{error} · <Link to="/">Go back</Link></div>;

  const st = STATUS_MAP[order.status] || STATUS_MAP.placed;
  const eta = new Date(order.etaAt);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title={`Tracking: ${order.id}`} subtitle="Live delivery status" />
        <div className="page-content">
          <div style={{ marginBottom: 20 }}>
            <Link to="/customer/dashboard" className="btn btn-ghost btn-sm"><ArrowLeft size={14} /> Back to Dashboard</Link>
          </div>
          <div className="two-col">
            <div>
              <div className="card mb-16" style={{ padding: 0, overflow: 'hidden' }}>
                <LiveMap order={order} height="450px" trackAgentId={order.agentId} />
              </div>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Order Details</div>
                  <span className={`badge ${st.class}`}>{st.label}</span>
                </div>
                <div className="grid grid-2" style={{ gap: 12 }}>
                  {[
                    ['Order ID', order.id], ['Package Type', order.packageType], ['Weight', order.weight],
                    ['Agent', order.agentName || 'Not assigned yet'],
                    [order.status === 'delivered' ? 'Delivered at' : 'Estimated arrival',
                      (order.status === 'delivered' ? new Date(order.deliveredAt) : eta).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })],
                  ].map(([label, value]) => (
                    <div key={label}><div className="text-xs text-muted">{label}</div><div className="text-sm font-semibold" style={{ marginTop: 2 }}>{value}</div></div>
                  ))}
                </div>
                <div style={{ marginTop: 16 }}><div className="text-xs text-muted">Pickup</div><div className="text-sm" style={{ marginTop: 2 }}>{order.pickupAddress}</div></div>
                <div style={{ marginTop: 12 }}><div className="text-xs text-muted">Drop Off</div><div className="text-sm" style={{ marginTop: 2 }}>{order.dropAddress}</div></div>
                {order.status === 'delivered' && !order.rating && (
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setRating(true)}>Rate this delivery</button>
                )}
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Delivery Status</div>
              <StatusTimeline statusLogs={order.statusLogs} currentStatus={order.status} />
            </div>
          </div>
        </div>
      </div>
      {rating && <RatingModal order={order} onClose={() => setRating(false)} onRated={fetchOrder} />}
    </div>
  );
}
