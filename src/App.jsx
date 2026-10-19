import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import Login from './pages/Login';
import Register from './pages/Register';

import CustomerDashboard from './pages/customer/Dashboard';
import TrackOrder from './pages/customer/TrackOrder';
import CustomerHistory from './pages/customer/History';

import AgentDashboard from './pages/agent/Dashboard';
import AgentNavigate from './pages/agent/Navigate';

import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminAgents from './pages/admin/Agents';
import AdminReports from './pages/admin/Reports';
import AdminMonitor from './pages/admin/Monitor';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader"><div className="loader-spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'agent') return <Navigate to="/agent/dashboard" replace />;
  return <Navigate to="/customer/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer */}
      <Route path="/customer/dashboard" element={
        <ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>
      } />
      <Route path="/customer/track/:orderId" element={
        <ProtectedRoute roles={['customer']}><TrackOrder /></ProtectedRoute>
      } />

      <Route path="/customer/history" element={
        <ProtectedRoute roles={['customer']}><CustomerHistory /></ProtectedRoute>
      } />

      {/* Agent */}
      <Route path="/agent/dashboard" element={
        <ProtectedRoute roles={['agent']}><AgentDashboard /></ProtectedRoute>
      } />
      <Route path="/agent/navigate/:orderId" element={
        <ProtectedRoute roles={['agent']}><AgentNavigate /></ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/monitor" element={
        <ProtectedRoute roles={['admin']}><AdminMonitor /></ProtectedRoute>
      } />
      <Route path="/admin/orders" element={
        <ProtectedRoute roles={['admin']}><AdminOrders /></ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>
      } />
      <Route path="/admin/agents" element={
        <ProtectedRoute roles={['admin']}><AdminAgents /></ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0d1526',
                color: '#f1f5f9',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '14px'
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#0d1526' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#0d1526' } }
            }}
          />
          <AppRoutes />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
