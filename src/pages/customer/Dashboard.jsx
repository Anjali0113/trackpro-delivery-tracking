import React, { useState, useEffect } from 'react';
import axios from '../../api';
import { Plus, Package, MapPin, Clock, CheckCircle, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import OrderForm from '../../components/OrderForm';
import RatingModal from '../../components/RatingModal';
import { useSocketEvent } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const STATUS_MAP = {
  placed: { label: 'Placed', class: 'badge-placed', icon: Clock },
  picked: { label: 'Picked Up', class: 'badge-picked', icon: Package },
  'in-transit': { label: 'In Transit', class: 'badge-transit', icon: Truck },
  delivered: { label: 'Delivered', class: 'badge-delivered', icon: CheckCircle },
};

export default function CustomerDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rateOrder, setRateOrder] = useState(null);
  const { user } = useAuth();

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);
  useSocketEvent('order:status', fetchOrders);
  useSocketEvent('order:assigned', fetchOrders);

  const stats = {
    total: orders.length,
    active: orders.filter(o => o.status !== 'delivered').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Dashboard" subtitle={`Welcome back, ${user?.name}`} />
        <div className="page-content">

          {/* Stats */}
          <div className="grid grid-3 mb-24">
            {[
              { label: 'Total Orders', value: stats.total, color: 'cyan', icon: Package },
              { label: 'Active Deliveries', value: stats.active, color: 'orange', icon: Truck },
              { label: 'Delivered', value: stats.delivered, color: 'green', icon: CheckCircle },
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

          {/* Orders */}
          <div className="page-header">
            <div>
              <div className="page-title">My <span>Orders</span></div>
              <div className="page-subtitle">{stats.active} active · {stats.delivered} in history</div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Place New Order
            </button>
          </div>

          {loading ? (
            <div className="loader"><div className="loader-spinner" /></div>
          ) : stats.active === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-title">No active orders</div>
              <div className="empty-state-text">Place an order, or see past deliveries under Delivery History</div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>
                <Plus size={16} /> Place Order
              </button>
            </div>
          ) : (
            <div className="grid grid-auto">
              {orders.filter(o => o.status !== 'delivered').map(order => {
                const st = STATUS_MAP[order.status] || STATUS_MAP.placed;
                const StatusIcon = st.icon;
                return (
                  <div key={order.id} className="order-card fade-in">
                    <div className="order-card-header">
                      <div className="order-id">{order.id}</div>
                      <span className={`badge ${st.class}`}>
                        <StatusIcon size={10} />{st.label}
                      </span>
                    </div>
                    <div className="order-locations">
                      <div className="location-item">
                        <div className="location-icon pickup"><MapPin size={12} /></div>
                        <div>
                          <div className="location-label">Pickup</div>
                          <div className="location-text">{order.pickupAddress}</div>
                        </div>
                      </div>
                      <div className="location-item">
                        <div className="location-icon drop"><MapPin size={12} /></div>
                        <div>
                          <div className="location-label">Drop</div>
                          <div className="location-text">{order.dropAddress}</div>
                        </div>
                      </div>
                    </div>
                    <div className="order-meta">
                      <div className="order-meta-row">
                        <Package size={12} />{order.packageType} · {order.weight}
                      </div>
                      {order.agentName && (
                        <div className="order-meta-row">
                          <Truck size={12} />Agent: {order.agentName}
                        </div>
                      )}
                    </div>
                    <div className="order-card-footer">
                      {order.status !== 'delivered' && order.agentId && (
                        <Link to={`/customer/track/${order.id}`} className="btn btn-cyan btn-sm">
                          <MapPin size={12} /> Track Live
                        </Link>
                      )}
                      {order.status !== 'delivered' && !order.agentId && <span className="text-xs text-muted">Waiting for agent assignment</span>}
                      <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {rateOrder && <RatingModal order={rateOrder} onClose={() => setRateOrder(null)} onRated={fetchOrders} />}
      {showForm && <OrderForm onClose={() => setShowForm(false)} onCreated={() => { fetchOrders(); }} />}
    </div>
  );
}
