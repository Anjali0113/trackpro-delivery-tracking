import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const t = localStorage.getItem('trackpro_token');
      const u = localStorage.getItem('trackpro_user');
      if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    } catch { /* corrupted storage – ignore */ }
    setLoading(false);
  }, []);

  const persist = ({ token: t, user: u }) => {
    setToken(t); setUser(u);
    localStorage.setItem('trackpro_token', t);
    localStorage.setItem('trackpro_user', JSON.stringify(u));
    return u;
  };

  const login = async (email, password) => persist((await api.post('/api/auth/login', { email, password })).data);
  const register = async (data) => persist((await api.post('/api/auth/register', data)).data);

  const logout = () => {
    setToken(null); setUser(null);
    localStorage.removeItem('trackpro_token');
    localStorage.removeItem('trackpro_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
