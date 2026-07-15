import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    authApi.getMe()
      .then((res) => {
        if (res.success && res.data.user) {
          setUser(res.data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.success && res.data.user) {
      setUser(res.data.user);
    }
    return res;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if logout API fails, clear local state
    }
    setUser(null);
  }, []);

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
