import React, { useState, useEffect } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, ArcElement, Filler,
} from 'chart.js';
import { Clock, Target, Activity, Star, Truck, Download } from 'lucide-react';
import api from '../../api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import KPICard from '../../components/KPICard';
import { useSocketEvent } from '../../context/SocketContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

const axisStyle = { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } };
const baseOpts = {
  responsive: true,
  plugins: { legend: { labels: { color: '#94a3b8' } }, tooltip: { backgroundColor: '#0d1526' } },
  scales: { x: axisStyle, y: { ...axisStyle, beginAtZero: true, ticks: { color: '#64748b', precision: 0 } } },
};

function downloadCSV(rows, name) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = Object.keys(rows[0] || {});
  const csv = [head.join(','), ...rows.map((r) => head.map((h) => esc(r[h])).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = name; a.click();
  URL.revokeObjectURL(a.href);
}

export default function Reports() {
  const [report, setReport] = useState(null);
  const load = () => api.get('/api/reports').then((r) => setReport(r.data));
  useEffect(() => { load(); }, []);
  useSocketEvent('order:status', load);

  if (!report) return <div className="loader"><div className="loader-spinner" /></div>;
  const { kpis, daily, statusCounts, agents } = report;
  const labels = daily.map((d) => new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }));

  const exportOrders = async () => {
    const { data } = await api.get('/api/orders');
    downloadCSV(data.map((o) => ({
      OrderID: o.id, Customer: o.customerName, Agent: o.agentName || '', Pickup: o.pickupAddress, Drop: o.dropAddress,
      Package: o.packageType, Status: o.status, Created: o.createdAt, Delivered: o.deliveredAt || '', Rating: o.rating || '',
    })), 'trackpro-orders.csv');
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Performance Reports" subtitle="KPIs and delivery analytics" />
        <div className="page-content">
          <div className="page-header">
            <div className="page-title">Key <span>Metrics</span></div>
            <button className="btn btn-ghost" onClick={exportOrders}><Download size={16} /> Export orders (CSV)</button>
          </div>

          <div className="grid grid-3 mb-24">
            <KPICard label="On-time Delivery Rate" value={`${kpis.onTimeRate}%`} icon={Target} color="green" />
            <KPICard label="Avg. Delivery Duration" value={`${kpis.avgDeliveryMinutes} min`} icon={Clock} color="cyan" />
            <KPICard label="Order Tracking Accuracy" value={`${kpis.trackingAccuracy}%`} icon={Activity} color="purple" />
            <KPICard label="Active Deliveries" value={kpis.activeDeliveries} icon={Truck} color="orange" />
            <KPICard label="Customer Satisfaction" value={kpis.satisfaction ? `${kpis.satisfaction} / 5` : '—'} icon={Star} color="blue" />
            <KPICard label="Delivered Orders" value={kpis.delivered} icon={Target} color="green" />
          </div>

          <div className="grid grid-2 mb-24">
            <div className="chart-card">
              <div className="chart-header"><div className="chart-title">Orders vs Deliveries (7 days)</div></div>
              <Line options={baseOpts} data={{ labels, datasets: [
                { label: 'Orders', data: daily.map((d) => d.orders), borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,0.15)', fill: true, tension: 0.4 },
                { label: 'Delivered', data: daily.map((d) => d.delivered), borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.1)', fill: true, tension: 0.4 },
              ] }} />
            </div>
            <div className="chart-card">
              <div className="chart-header"><div className="chart-title">Status Distribution</div></div>
              <div style={{ maxWidth: 260, margin: '0 auto' }}>
                <Doughnut options={{ cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} data={{
                  labels: ['Placed', 'Picked', 'In Transit', 'Delivered'],
                  datasets: [{ data: [statusCounts.placed, statusCounts.picked, statusCounts.inTransit, statusCounts.delivered], backgroundColor: ['#f59e0b', '#4f46e5', '#00d4ff', '#10b981'], borderWidth: 0 }],
                }} />
              </div>
            </div>
          </div>

          <div className="grid grid-2 mb-24">
            <div className="chart-card">
              <div className="chart-header"><div className="chart-title">Completed Deliveries per Agent</div></div>
              <Bar options={{ ...baseOpts, plugins: { ...baseOpts.plugins, legend: { display: false } } }} data={{
                labels: agents.map((a) => a.name),
                datasets: [{ data: agents.map((a) => a.completed), backgroundColor: 'rgba(0,212,255,0.6)', borderRadius: 6 }],
              }} />
            </div>
            <div className="card">
              <div className="chart-title" style={{ marginBottom: 12 }}>Agent Performance</div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Agent</th><th>Done</th><th>On-time</th><th>Avg time</th><th>Rating</th></tr></thead>
                  <tbody>
                    {agents.map((a) => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.name}</td>
                        <td>{a.completed}</td><td>{a.onTimeRate}%</td><td>{a.avgDuration} min</td><td>{a.avgRating ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="text-xs text-muted">
            On-time = delivered before the promised ETA (30 min handling + distance at ~30 km/h). Tracking accuracy = delivered orders whose status history is complete and in order.
          </div>
        </div>
      </div>
    </div>
  );
}
