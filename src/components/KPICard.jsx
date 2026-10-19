import React from 'react';

export default function KPICard({ label, value, icon: Icon, color = 'cyan', change }) {
  return (
    <div className={`kpi-card ${color} fade-in`}>
      <div className="kpi-info">
        <div className="kpi-label">{label}</div>
        <div className={`kpi-value ${color}`}>{value}</div>
        {change && <div className="kpi-change">↑ {change}</div>}
      </div>
      <div className={`kpi-icon ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  );
}
