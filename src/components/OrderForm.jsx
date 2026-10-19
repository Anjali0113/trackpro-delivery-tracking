import React, { useState } from 'react';
import axios from '../api';
import { Package, MapPin, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CITY_COORDS = {
  'New Delhi': { lat: 28.6139, lng: 77.2090 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
};

export default function OrderForm({ onClose, onCreated }) {
  const [form, setForm] = useState({
    pickupAddress: '', dropAddress: '',
    pickupCity: 'New Delhi', dropCity: 'Mumbai',
    packageType: 'General', weight: '1 kg'
  });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pickupAddress || !form.dropAddress) { toast.error('Fill all required fields'); return; }
    setLoading(true);
    const pickup = CITY_COORDS[form.pickupCity] || { lat: 20.5937, lng: 78.9629 };
    const drop = CITY_COORDS[form.dropCity] || { lat: 19.0760, lng: 72.8777 };
    const offset = (Math.random() - 0.5) * 0.05;
    try {
      const res = await axios.post('/api/orders', {
        pickupAddress: `${form.pickupAddress}, ${form.pickupCity}`,
        dropAddress: `${form.dropAddress}, ${form.dropCity}`,
        packageType: form.packageType,
        weight: form.weight,
        pickupLat: pickup.lat + offset,
        pickupLng: pickup.lng + offset,
        dropLat: drop.lat + offset,
        dropLng: drop.lng + offset,
      });
      toast.success(`Order ${res.data.id} placed successfully!`);
      onCreated(res.data);
      onClose();
    } catch (e) {
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Place New Order</div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-2" style={{ gap: 16, marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Pickup Address *</label>
              <input className="form-input" name="pickupAddress" value={form.pickupAddress} onChange={handle} placeholder="Street / Area" />
            </div>
            <div className="form-group">
              <label className="form-label">Pickup City</label>
              <select className="form-select" name="pickupCity" value={form.pickupCity} onChange={handle}>
                {Object.keys(CITY_COORDS).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Drop Address *</label>
              <input className="form-input" name="dropAddress" value={form.dropAddress} onChange={handle} placeholder="Street / Area" />
            </div>
            <div className="form-group">
              <label className="form-label">Drop City</label>
              <select className="form-select" name="dropCity" value={form.dropCity} onChange={handle}>
                {Object.keys(CITY_COORDS).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Package Type</label>
              <select className="form-select" name="packageType" value={form.packageType} onChange={handle}>
                {['General','Electronics','Clothing','Documents','Food Items','Books','Fragile'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Weight</label>
              <select className="form-select" name="weight" value={form.weight} onChange={handle}>
                {['0.5 kg','1 kg','2 kg','5 kg','10 kg','20 kg'].map(w => <option key={w}>{w}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-12">
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              <Package size={16} />
              {loading ? 'Placing...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
