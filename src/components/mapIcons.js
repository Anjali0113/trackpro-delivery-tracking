import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export const agentIcon = L.divIcon({
  className: '',
  html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#00d4ff,#4f46e5);border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 12px rgba(0,212,255,0.5);font-size:16px;">🛵</div>`,
  iconSize: [36, 36], iconAnchor: [18, 18],
});

const pin = (color) => L.divIcon({
  className: '',
  html: `<div style="width:30px;height:30px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 12px ${color};"></div>`,
  iconSize: [30, 30], iconAnchor: [15, 30],
});
export const pickupIcon = pin('rgba(16,185,129,0.95)');
export const dropIcon = pin('rgba(239,68,68,0.95)');
export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTR = '&copy; OpenStreetMap contributors';
