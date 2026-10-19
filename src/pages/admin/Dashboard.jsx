import React, { useState, useEffect } from 'react';
import axios from '../../api';
import { Package, Truck, Users, CheckCircle, Clock, TrendingUp, Activity } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import KPICard from '../../components/KPICard';
import { Link } from 'react-router-dom';
import { useSocketEvent } from '../../context/SocketContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);


export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => Promise.all([
    axios.get('/api/dashboard/stats'),
    axios.get('/api/orders'),
  ]).then(([s, o]) => {
    setStats(s.data);
    setOrders(o.data);
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);
  useSocketEvent('order:status', load);
  useSocketEvent('order:new', load);
  useSocketEvent('order:assigned', load);

  if (loading) return <div className="loader"><div className="loader-spinner" /></div>;

  const lineChartData = {
    labels: (stats?.days || []).map(d => new Date(d).toLocaleDateString('en-IN', { weekday: 'short' })),
    datasets: [
      {
        label: 'Orders',
        data: stats?.weeklyOrders || [],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79,70,229,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4f46e5',
        pointRadius: 4,
      },
      {
        label: 'Delivered',
        data: stats?.weeklyDeliveries || [],
        borderColor: '#00d4ff',
        backgroundColor: 'rgba(0,212,255,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00d4ff',
        pointRadius: 4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } } },
      tooltip: { backgroundColor: '#0d1526', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 },
    },
    scales: {
      x: { ticks: { color: '#475569' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#475569' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  const doughnutData = {
    labels: ['Placed', 'Picked', 'In Transit', 'Delivered'],
    datasets: [{
      data: [stats?.placed || 0, stats?.picked || 0, stats?.inTransit || 0, stats?.delivered || 0],
      backgroundColor: ['rgba(245,158,11,0.8)', 'rgba(79,70,229,0.8)', 'rgba(0,212,255,0.8)', 'rgba(16,185,129,0.8)'],
      borderColor: ['#f59e0b', '#4f46e5', '#00d4ff', '#10b981'],
      borderWidth: 2,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, padding: 16 } },
      tooltip: { backgroundColor: '#0d1526', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 },
    },
    cutout: '65%',
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Admin Dashboard" subtitle="System overview and performance" />
        <div className="page-content">

          {/* KPI Grid */}
          <div className="grid grid-4 mb-24">
            <KPICard label="Total Orders" value={stats.total} icon={Package} color="cyan" />
            <KPICard label="Active Deliveries" value={stats.activeDeliveries} icon={Truck} color="orange" />
            <KPICard label="Delivered" value={stats.delivered} icon={CheckCircle} color="green" change={`${stats.onTimeRate}% on time`} />
            <KPICard label="Active Agents" value={stats.agents} icon={Users} color="blue" />
          </div>

          {/* Charts */}
          <div className="grid grid-2 mb-24">
            <div className="chart-card">
              <div className="chart-header">
                <div className="chart-title">Weekly Order Trends</div>
                <span className="badge badge-placed">Last 7 Days</span>
              </div>
              <Line data={lineChartData} options={lineChartOptions} />
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <div className="chart-title">Order Status Distribution</div>
                <span className="badge badge-transit">Live</span>
              </div>
              <div style={{ maxWidth: 260, margin: '0 auto' }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card">
            <div className="chart-header">
              <div className="chart-title">Recent Orders</div>
              <Link to="/admin/orders" style={{ color: 'var(--accent-cyan)', fontSize: 13 }}>View all</Link>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Agent</th>
                    <th>Package</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.id}</td>
                      <td>{order.customerName}</td>
                      <td>{order.agentName || <span style={{color:'var(--text-muted)'}}>Unassigned</span>}</td>
                      <td>{order.packageType}</td>
                      <td>
                        <span className={`badge badge-${
                          order.status === 'in-transit' ? 'transit' :
                          order.status === 'placed' ? 'placed' :
                          order.status === 'picked' ? 'picked' : 'delivered'
                        }`}>{order.status}</span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
