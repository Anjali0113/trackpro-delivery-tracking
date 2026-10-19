import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Users, Truck, BarChart3,
  LogOut, MapPin, Radar, ClipboardList, History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/monitor', icon: Radar, label: 'Live Monitor' },
  { to: '/admin/orders', icon: Package, label: 'Orders' },
  { to: '/admin/agents', icon: Truck, label: 'Delivery Agents' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
];

const agentNav = [
  { to: '/agent/dashboard', icon: ClipboardList, label: 'My Deliveries' },
];

const customerNav = [
  { to: '/customer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customer/history', icon: History, label: 'Delivery History' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = user?.role === 'admin' ? adminNav
    : user?.role === 'agent' ? agentNav
    : customerNav;

  const roleLabel = user?.role === 'admin' ? 'Administrator'
    : user?.role === 'agent' ? 'Delivery Agent'
    : 'Customer';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <>
    <div className="sidebar-backdrop" onClick={() => document.body.classList.remove('sidebar-open')} />
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <MapPin size={20} color="#060b18" strokeWidth={2.5} />
        </div>
        <div>
          <div className="logo-text">Track<span>Pro</span></div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Delivery System</div>
        </div>
      </div>

      <div className="sidebar-role">{roleLabel} Panel</div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => document.body.classList.remove('sidebar-open')}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{initials}</div>
          <div className="user-details">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.email}</div>
          </div>
        </div>
        <button
          className="btn btn-ghost w-full"
          style={{ marginTop: '10px', justifyContent: 'center' }}
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
    </>
  );
}
