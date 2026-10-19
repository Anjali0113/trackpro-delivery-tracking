import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DEMO_CREDS = [
  { role: 'Admin', email: 'admin@trackpro.com', password: 'admin123' },
  { role: 'Agent', email: 'agent@trackpro.com', password: 'agent123' },
  { role: 'Customer', email: 'customer@trackpro.com', password: 'customer123' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'agent') navigate('/agent/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setLoading(true);
    try {
      const user = await login(cred.email, cred.password);
      toast.success(`Logged in as ${user.name}`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'agent') navigate('/agent/dashboard');
      else navigate('/customer/dashboard');
    } catch {
      toast.error('Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <MapPin size={28} color="#060b18" strokeWidth={2.5} />
          </div>
          <div className="auth-title">TrackPro</div>
          <div className="auth-subtitle">Real-Time Delivery Management</div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="login-email"
                className="form-input"
                style={{ paddingLeft: 40 }}
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="login-password"
                className="form-input"
                style={{ paddingLeft: 40 }}
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button id="login-submit" type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider" style={{ margin: '24px 0' }}>Quick Access</div>

        <div className="demo-credentials">
          <div className="demo-title">Demo Credentials</div>
          {DEMO_CREDS.map(cred => (
            <div
              key={cred.role}
              className="demo-item"
              style={{ cursor: 'pointer', padding: '6px 8px', borderRadius: 6, transition: 'background 0.2s' }}
              onClick={() => quickLogin(cred)}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span className="demo-item-label">{cred.role}</span>
              <span className="demo-item-value">{cred.email}</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Click any row to quick login</div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-cyan)' }}>Create one</Link>
        </div>
      </div>
    </div>
  );
}
