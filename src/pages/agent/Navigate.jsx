import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Radio, Satellite, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import LiveMap from '../../components/LiveMap';
import { useSocket } from '../../context/SocketContext';

const NEXT = { placed: 'picked', picked: 'in-transit', 'in-transit': 'delivered' };
const NEXT_LABEL = { placed: 'Mark Picked Up', picked: 'Mark In Transit', 'in-transit': 'Mark Delivered' };

export default function AgentNavigate() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [mode, setMode] = useState('gps'); // 'gps' = real device location, 'sim' = demo route
  const [broadcasting, setBroadcasting] = useState(false);
  const [pos, setPos] = useState(null);
  const timer = useRef(null);
  const watch = useRef(null);
  const { emitLocation, connected } = useSocket();

  useEffect(() => { api.get(`/api/orders/${orderId}`).then((r) => setOrder(r.data)).catch(() => toast.error('Order not found')); }, [orderId]);

  const stop = (silent) => {
    clearInterval(timer.current);
    if (watch.current != null) navigator.geolocation.clearWatch(watch.current);
    timer.current = null; watch.current = null;
    setBroadcasting(false);
    if (!silent) toast('Location sharing stopped');
  };
  useEffect(() => () => stop(true), []); // eslint-disable-line

  const push = (lat, lng) => { setPos({ lat, lng }); emitLocation(lat, lng, orderId); };

  const start = () => {
    if (!connected) { toast.error('Not connected to the server'); return; }
    if (mode === 'gps') {
      if (!navigator.geolocation) { toast.error('GPS is not supported on this device'); return; }
      watch.current = navigator.geolocation.watchPosition(
        (p) => push(p.coords.latitude, p.coords.longitude),
        (e) => { toast.error(e.code === 1 ? 'Location permission denied' : 'Could not get GPS position'); stop(true); },
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
      );
    } else {
      let step = 0;
      timer.current = setInterval(() => {
        step += 0.02;
        if (step >= 1) { stop(); return; }
        push(order.pickupLat + (order.dropLat - order.pickupLat) * step, order.pickupLng + (order.dropLng - order.pickupLng) * step);
      }, 2000);
    }
    setBroadcasting(true);
    toast.success('Sharing live location');
  };

  const advance = async () => {
    try {
      const { data } = await api.patch(`/api/orders/${orderId}/status`, { status: NEXT[order.status] });
      setOrder((o) => ({ ...o, ...data }));
      toast.success('Status updated');
      if (data.status === 'delivered') stop(true);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update'); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Navigation Mode" subtitle={`Order: ${orderId}`} />
        <div className="page-content">
          <div style={{ marginBottom: 20 }}>
            <Link to="/agent/dashboard" className="btn btn-ghost btn-sm"><ArrowLeft size={14} /> Back</Link>
          </div>
          <div className="two-col">
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <LiveMap order={order} height="500px" agentPosition={pos} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Share Location</div>
                <div className="live-dot" style={{ marginBottom: 14 }}>
                  <div className="live-dot-pulse" style={{ background: broadcasting ? 'var(--accent-green)' : 'var(--accent-red)' }} />
                  {broadcasting ? 'Broadcasting live' : 'Not broadcasting'}
                </div>
                {!broadcasting && (
                  <div className="seg" style={{ marginBottom: 14 }}>
                    <button className={mode === 'gps' ? 'on' : ''} onClick={() => setMode('gps')}><Satellite size={14} /> My GPS</button>
                    <button className={mode === 'sim' ? 'on' : ''} onClick={() => setMode('sim')}><PlayCircle size={14} /> Demo route</button>
                  </div>
                )}
                {!broadcasting
                  ? <button className="btn btn-success btn-block" onClick={start} disabled={!order}><Radio size={16} /> Start sharing</button>
                  : <button className="btn btn-danger btn-block" onClick={() => stop()}>Stop sharing</button>}
                <div className="text-xs text-muted" style={{ marginTop: 12, textAlign: 'center' }}>
                  {mode === 'gps' ? 'Uses your device GPS (allow location access in the browser).' : 'Simulates a ride from pickup to drop – ideal for demos on a laptop.'}
                </div>
              </div>

              {order && NEXT[order.status] && (
                <button className="btn btn-primary btn-block" onClick={advance}>{NEXT_LABEL[order.status]}</button>
              )}

              {order && (
                <div className="card">
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Route Info</div>
                  <div className="text-xs text-muted">Pickup</div><div className="text-sm" style={{ margin: '2px 0 10px' }}>{order.pickupAddress}</div>
                  <div className="text-xs text-muted">Drop Off</div><div className="text-sm" style={{ marginTop: 2 }}>{order.dropAddress}</div>
                  {pos && <div className="text-xs text-secondary" style={{ marginTop: 12 }}>📍 {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
