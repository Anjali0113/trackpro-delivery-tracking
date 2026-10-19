import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function RatingModal({ order, onClose, onRated }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const { data } = await api.post(`/api/orders/${order.id}/rating`, { rating, feedback });
      toast.success('Thanks for your feedback!');
      onRated(data); onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not submit rating');
    } finally { setBusy(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Rate delivery {order.id}</div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="star-row">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" className={`star ${n <= rating ? 'on' : ''}`} onClick={() => setRating(n)} aria-label={`${n} stars`}>
              <Star size={30} fill={n <= rating ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
        <div className="form-group" style={{ margin: '16px 0 20px' }}>
          <label className="form-label">Feedback (optional)</label>
          <textarea className="form-input" rows={3} maxLength={300} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How was the delivery?" />
        </div>
        <div className="flex gap-12">
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={submit} disabled={busy}>{busy ? 'Submitting…' : 'Submit'}</button>
        </div>
      </div>
    </div>
  );
}
