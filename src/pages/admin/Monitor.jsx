import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Package } from 'lucide-react';
import api from '../../api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { agentIcon, pickupIcon, dropIcon, TILE_URL, TILE_ATTR } from '../../components/mapIcons';
import { useSocketEvent } from '../../context/SocketContext';

const BADGE = { placed: 'badge-placed', picked: 'badge-picked', 'in-transit': 'badge-transit' };

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => { if (target) map.flyTo(target, 13, { duration: 0.8 }); }, [target?.[0], target?.[1]]); // eslint-disable-line
  return null;
}

export default function Monitor() {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [locations, setLocations] = useState({});
  const [selected, setSelected] = useState(null);
  const [fly, setFly] = useState(null);

  const load = useCallback(async () => {
    const [o, a, l] = await Promise.all([api.get('/api/orders'), api.get('/api/agents'), api.get('/api/locations')]);
    setOrders(o.data.filter((x) => x.status !== 'delivered'));
    setAgents(a.data);
    setLocations(l.data);
  }, []);
  useEffect(() => { load(); }, [load]);

  useSocketEvent('location:broadcast', (d) => setLocations((p) => ({ ...p, [d.agentId]: { lat: d.lat, lng: d.lng } })));
  useSocketEvent('order:status', load);
  useSocketEvent('order:assigned', load);
  useSocketEvent('order:new', load);

  const agentName = (id) => agents.find((a) => a.id === id)?.name || 'Agent';
  const sel = orders.find((o) => o.id === selected);
  const live = Object.entries(locations);

  const pick = (o) => {
    setSelected(o.id);
    const loc = o.agentId && locations[o.agentId];
    setFly(loc ? [loc.lat, loc.lng] : [o.pickupLat, o.pickupLng]);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Live Monitor" subtitle={`${orders.length} active deliveries · ${live.length} agents on map`} />
        <div className="page-content">
          <div className="monitor-grid">
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="map-container" style={{ height: 'calc(100vh - 170px)', minHeight: 420 }}>
                <MapContainer center={[22.5, 78.9]} zoom={5} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
                  {live.map(([id, p]) => (
                    <Marker key={id} position={[p.lat, p.lng]} icon={agentIcon}>
                      <Popup><strong>{agentName(id)}</strong><br />{orders.filter((o) => o.agentId === id).length} active order(s)</Popup>
                    </Marker>
                  ))}
                  {sel && (
                    <>
                      <Marker position={[sel.pickupLat, sel.pickupLng]} icon={pickupIcon}><Popup>Pickup: {sel.pickupAddress}</Popup></Marker>
                      <Marker position={[sel.dropLat, sel.dropLng]} icon={dropIcon}><Popup>Drop: {sel.dropAddress}</Popup></Marker>
                      <Polyline positions={[[sel.pickupLat, sel.pickupLng], [sel.dropLat, sel.dropLng]]} pathOptions={{ color: '#00d4ff', weight: 3, dashArray: '8 4' }} />
                    </>
                  )}
                  <FlyTo target={fly} />
                </MapContainer>
              </div>
            </div>

            <div className="monitor-list">
              <div className="chart-title" style={{ marginBottom: 12 }}>Active deliveries</div>
              {orders.length === 0 && <div className="empty-state"><div className="empty-state-icon">🛵</div><div className="empty-state-title">No active deliveries</div></div>}
              {orders.map((o) => (
                <div key={o.id} className="order-card" style={{ cursor: 'pointer', marginBottom: 10, border: selected === o.id ? '1px solid rgba(0,212,255,0.5)' : undefined }} onClick={() => pick(o)}>
                  <div className="order-card-header">
                    <div className="order-id">{o.id}</div>
                    <span className={`badge ${BADGE[o.status]}`}>{o.status}</span>
                  </div>
                  <div className="order-meta">
                    <div className="order-meta-row"><MapPin size={12} />{o.dropAddress}</div>
                    <div className="order-meta-row"><Package size={12} />{o.agentName || 'Unassigned'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
