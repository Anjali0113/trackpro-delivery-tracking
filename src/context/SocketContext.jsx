import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { API_URL } from '../api';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const userRef = useRef(user);
  userRef.current = user;

  const notify = useCallback((msg, type = 'info') => {
    setNotifications((prev) => [{ id: Date.now() + Math.random(), msg, type, time: new Date(), read: false }, ...prev].slice(0, 20));
    toast(msg, { icon: type === 'success' ? '✅' : '🔔' });
  }, []);

  useEffect(() => {
    if (!user || !token) { setSocket(null); setConnected(false); return; }
    const s = io(API_URL, { auth: { token }, transports: ['websocket', 'polling'] });
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('order:status', ({ orderId, status }) =>
      notify(`Order ${orderId} is now ${status.replace('-', ' ').toUpperCase()}`, status === 'delivered' ? 'success' : 'info'));
    s.on('order:new', (o) => notify(`New order placed: ${o.id}`));
    s.on('order:assigned', (d) => notify(`Order ${d.orderId} assigned to ${d.agentName}`));
    setSocket(s);
    return () => { s.disconnect(); };
  }, [user?.id, token, notify]);

  const joinOrderRoom = useCallback((orderId) => socket?.emit('join:order', orderId), [socket]);
  const emitLocation = useCallback((lat, lng, orderId) => socket?.emit('location:update', { lat, lng, orderId }), [socket]);
  const markAllRead = useCallback(() => setNotifications((p) => p.map((n) => ({ ...n, read: true }))), []);

  return (
    <SocketContext.Provider value={{ socket, connected, notifications, markAllRead, joinOrderRoom, emitLocation }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

/** Subscribe to a socket event for the lifetime of a component (safe even before the socket connects). */
export function useSocketEvent(event, handler) {
  const { socket } = useSocket();
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!socket) return;
    const fn = (...args) => ref.current(...args);
    socket.on(event, fn);
    return () => socket.off(event, fn);
  }, [socket, event]);
}
