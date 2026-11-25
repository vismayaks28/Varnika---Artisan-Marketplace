import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('varnika_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const res = await authApi.getMe();
    setUser(res.data);
    localStorage.setItem('varnika_user', JSON.stringify(res.data));
    return res.data;
  };

  useEffect(() => {
    const token = localStorage.getItem('varnika_access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    refreshUser()
      .catch(() => {
        localStorage.removeItem('varnika_access_token');
        localStorage.removeItem('varnika_refresh_token');
        localStorage.removeItem('varnika_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = ({ access, refresh, user: userData }) => {
    localStorage.setItem('varnika_access_token', access);
    localStorage.setItem('varnika_refresh_token', refresh);
    localStorage.setItem('varnika_user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    persistSession(res.data);
    return res.data.user;
  };

  const registerBuyer = async (formData) => {
    const res = await authApi.registerBuyer(formData);
    persistSession(res.data);
    return res.data.user;
  };

  const applySeller = async (formData) => {
    const res = await authApi.applySeller(formData);
    persistSession(res.data);
    return res.data.user;
  };

  const updateProfile = async (profileData) => {
    const res = await authApi.updateMe(profileData);
    setUser(res.data);
    localStorage.setItem('varnika_user', JSON.stringify(res.data));
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('varnika_access_token');
    localStorage.removeItem('varnika_refresh_token');
    localStorage.removeItem('varnika_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isSeller: user?.role === 'seller',
        isBuyer: user?.role === 'buyer',
        login,
        registerBuyer,
        applySeller,
        refreshUser,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}