import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useSocketEvent } from '../context/SocketContext';
import { agentIcon, pickupIcon, dropIcon, TILE_URL, TILE_ATTR } from './mapIcons';

function FitView({ points, follow }) {
  const map = useMap();
  useEffect(() => {
    if (follow) map.panTo(follow, { animate: true });
  }, [follow?.[0], follow?.[1]]); // eslint-disable-line
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [50, 50], maxZoom: 15 });
  }, [points.map((p) => p.join()).join('|')]); // eslint-disable-line
  return null;
}

/**
 * Shows pickup, drop and the live agent marker.
 * - `agentPosition` → controlled position (agent's own screen)
 * - `trackAgentId`  → follow that agent via WebSocket (customer / admin screens)
 */
export default function LiveMap({ order, height = '400px', trackAgentId = null, agentPosition = null }) {
  const [livePos, setLivePos] = useState(order?.agentLocation || null);

  useEffect(() => { if (order?.agentLocation) setLivePos(order.agentLocation); }, [order?.agentLocation?.lat, order?.agentLocation?.lng]);

  useSocketEvent('location:broadcast', (d) => {
    if (trackAgentId && d.agentId === trackAgentId) setLivePos({ lat: d.lat, lng: d.lng });
  });

  const agent = agentPosition || (order?.status !== 'delivered' ? livePos : null);
  const pickup = order ? [order.pickupLat, order.pickupLng] : null;
  const drop = order ? [order.dropLat, order.dropLng] : null;
  const agentPt = agent ? [agent.lat, agent.lng] : null;
  const fitPoints = [pickup, drop].filter(Boolean);

  return (
    <div className="map-container" style={{ height }}>
      <MapContainer center={pickup || [20.5937, 78.9629]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
        {order && (
          <>
            <Marker position={pickup} icon={pickupIcon}><Popup><strong>Pickup</strong><br />{order.pickupAddress}</Popup></Marker>
            <Marker position={drop} icon={dropIcon}><Popup><strong>Drop</strong><br />{order.dropAddress}</Popup></Marker>
            <Polyline positions={[pickup, drop]} pathOptions={{ color: '#64748b', weight: 2, dashArray: '4 8', opacity: 0.7 }} />
          </>
        )}
        {agentPt && (
          <>
            <Marker position={agentPt} icon={agentIcon}>
              <Popup><strong>{order?.agentName || 'Delivery agent'}</strong><br />Live location</Popup>
            </Marker>
            {order && <Polyline positions={[agentPt, drop]} pathOptions={{ color: '#00d4ff', weight: 3, dashArray: '8 4', opacity: 0.9 }} />}
          </>
        )}
        <FitView points={fitPoints} follow={agentPt} />
      </MapContainer>
    </div>
  );
}
