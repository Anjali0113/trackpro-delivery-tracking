import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const timeAgo = (d) => {
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  return s < 60 ? 'just now' : s < 3600 ? `${Math.floor(s / 60)}m ago` : `${Math.floor(s / 3600)}h ago`;
};

export default function Navbar({ title, subtitle }) {
  const { user } = useAuth();
  const { connected, notifications, markAllRead } = useSocket();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const toggleBell = () => { setOpen((o) => !o); if (!open) markAllRead(); };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-btn" aria-label="Menu" onClick={() => document.body.classList.toggle('sidebar-open')}>
          <Menu size={20} />
        </button>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>{title}</div>
          {subtitle && <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{subtitle}</div>}
        </div>
      </div>
      <div className="navbar-right">
        <div className="live-dot">
          <div className="live-dot-pulse" style={{ background: connected ? 'var(--accent-green)' : 'var(--accent-red)' }} />
          {connected ? 'Live' : 'Offline'}
        </div>
        <div ref={ref} style={{ position: 'relative' }}>
          <button className="notification-btn" onClick={toggleBell} aria-label="Notifications">
            <Bell size={16} />
            {unread > 0 && <span className="notification-dot" />}
          </button>
          {open && (
            <div className="notif-panel">
              <div className="notif-title">Notifications</div>
              {notifications.length === 0 ? (
                <div className="notif-empty">You're all caught up</div>
              ) : notifications.map((n) => (
                <div key={n.id} className="notif-item">
                  <div>{n.msg}</div>
                  <div className="text-xs text-muted">{timeAgo(n.time)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="user-avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
          {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
      </div>
    </header>
  );
}
