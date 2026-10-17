// AuthContext.jsx
// Provides user authentication state to the entire app
// Any component can call useAuth() to know who is logged in

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Try to load saved user from localStorage (persists page refresh)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Called after a successful login
  function login(userData, token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }

  // Called when user clicks logout
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — makes using context cleaner in other components
// Usage: const { user, login, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
