import React, { useState, useEffect } from 'react';
import axios from '../../api';
import { Search, Users, ShieldCheck, Truck, UserCircle } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/users').then(r => {
      setUsers(r.data);
      setFiltered(r.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = users;
    if (roleFilter !== 'all') result = result.filter(u => u.role === roleFilter);
    if (search) result = result.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, roleFilter, users]);

  const toggleStatus = async (u) => {
    try {
      const r = await axios.patch(`/api/users/${u.id}/status`);
      setUsers(prev => prev.map(x => x.id === u.id ? r.data : x));
      toast.success(r.data.status === 'inactive' ? 'User deactivated' : 'User activated');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const ROLE_ICONS = { admin: ShieldCheck, agent: Truck, customer: UserCircle };
  const ROLE_CLASSES = { admin: 'badge-admin', agent: 'badge-agent', customer: 'badge-customer' };

  const stats = {
    admins: users.filter(u => u.role === 'admin').length,
    agents: users.filter(u => u.role === 'agent').length,
    customers: users.filter(u => u.role === 'customer').length,
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="User Management" subtitle={`${users.length} registered users`} />
        <div className="page-content">

          <div className="grid grid-3 mb-24">
            {[
              { label: 'Admins', value: stats.admins, color: 'purple', icon: ShieldCheck },
              { label: 'Delivery Agents', value: stats.agents, color: 'cyan', icon: Truck },
              { label: 'Customers', value: stats.customers, color: 'green', icon: Users },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className={`kpi-card ${color} fade-in`}>
                <div className="kpi-info">
                  <div className="kpi-label">{label}</div>
                  <div className={`kpi-value ${color}`}>{value}</div>
                </div>
                <div className={`kpi-icon ${color}`}><Icon size={24} /></div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div className="search-box" style={{ flex: 1 }}>
              <Search size={16} />
              <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 140 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="agent">Agent</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          {loading ? (
            <div className="loader"><div className="loader-spinner" /></div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(user => {
                      const RoleIcon = ROLE_ICONS[user.role];
                      return (
                        <tr key={user.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
                            </div>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{user.email}</td>
                          <td>{user.phone || '—'}</td>
                          <td>
                            <span className={`badge ${ROLE_CLASSES[user.role]}`}>
                              <RoleIcon size={10} />{user.role}
                            </span>
                          </td>
                          <td style={{ fontSize: 12 }}>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                          <td>
                            {user.id === me.id ? <span className="text-xs text-muted">You</span> : (
                              <button className="btn btn-ghost btn-sm" onClick={() => toggleStatus(user)}>
                                {user.status === 'inactive' ? 'Activate' : 'Deactivate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
