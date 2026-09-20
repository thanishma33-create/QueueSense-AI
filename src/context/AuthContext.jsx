import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService, getAuthToken, setAuthToken } from '../services/api';
import { DEMO_USERS } from '../services/mockData';

const AuthContext = createContext(null);

const ROLE_CREDENTIALS = {
  reception: { email: 'reception@queuesense.demo', password: 'Reception@123' },
  doctor: { email: 'doctor@queuesense.demo', password: 'Doctor@123' },
  admin: { email: 'admin@queuesense.demo', password: 'Admin@123' },
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('queuesense_auth_user');
      return saved ? JSON.parse(saved) : DEMO_USERS[0];
    } catch {
      return DEMO_USERS[0];
    }
  });

  const [token, setToken] = useState(() => getAuthToken());
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const isAuthStored = localStorage.getItem('queuesense_is_auth');
    return isAuthStored !== 'false';
  });
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Validate active session against backend on load
  const verifySession = useCallback(async () => {
    const existingToken = getAuthToken();
    if (!existingToken) return;

    try {
      const profile = await apiService.getCurrentUser();
      if (profile) {
        setCurrentUser(profile);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.warn('Session verification failed, resetting token:', err);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('queuesense_auth_user', JSON.stringify(currentUser));
    }
    localStorage.setItem('queuesense_is_auth', isAuthenticated ? 'true' : 'false');
  }, [currentUser, isAuthenticated]);

  // Login with explicit email & password (calls POST /api/auth/login)
  const login = async (email, password) => {
    setIsAuthLoading(true);
    try {
      const res = await apiService.login(email, password);
      if (res.success) {
        setCurrentUser(res.user);
        setToken(res.token);
        setIsAuthenticated(true);
        return { success: true, user: res.user };
      }
      return { success: false, error: 'Login failed' };
    } catch (err) {
      console.error('Authentication error:', err);
      return { success: false, error: err.message || 'Authentication error' };
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Switch perspective directly with demo credentials and real JWT
  const switchRole = async (roleKey) => {
    const creds = ROLE_CREDENTIALS[roleKey] || ROLE_CREDENTIALS.reception;
    try {
      const res = await login(creds.email, creds.password);
      if (res.success) return res;
    } catch {
      // Fallback to local user
    }
    const fallbackUser = DEMO_USERS.find(u => u.role === roleKey) || DEMO_USERS[0];
    setCurrentUser(fallbackUser);
    setIsAuthenticated(true);
    return { success: true, user: fallbackUser };
  };

  // Direct loginAs helper for mock/local objects
  const loginAs = (userObj) => {
    setCurrentUser(userObj);
    setIsAuthenticated(true);
  };

  // Logout & revoke token
  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('queuesense_auth_user');
    localStorage.setItem('queuesense_is_auth', 'false');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      token,
      isAuthenticated,
      isAuthLoading,
      login,
      switchRole,
      loginAs,
      logout,
      availableRoles: DEMO_USERS,
      isReception: currentUser?.role === 'reception',
      isDoctor: currentUser?.role === 'doctor',
      isAdmin: currentUser?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
