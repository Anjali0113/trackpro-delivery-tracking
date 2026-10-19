import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Mail, Lock, User, Phone, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'customer' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome, ${user.name}!`);
      if (user.role === 'agent') navigate('/agent/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-card fade-in" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <MapPin size={28} color="#060b18" strokeWidth={2.5} />
          </div>
          <div className="auth-title">Create Account</div>
          <div className="auth-subtitle">Join TrackPro today</div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="grid grid-2" style={{ gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft: 40 }} name="name" placeholder="Full name" value={form.name} onChange={handle} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft: 40 }} name="phone" placeholder="+91 99999 99999" value={form.phone} onChange={handle} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" style={{ paddingLeft: 40 }} name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handle} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" style={{ paddingLeft: 40 }} name="password" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={handle} required minLength={6} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Register As</label>
            <select className="form-select" name="role" value={form.role} onChange={handle}>
              <option value="customer">Customer</option>
              <option value="agent">Delivery Agent</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            <UserPlus size={18} />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-cyan)' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
