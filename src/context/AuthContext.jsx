import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (role) => {
    // Mock user data for different roles
    const userData = {
      admin: { id: 1, name: 'Admin User', role: 'admin' },
      chef: { id: 2, name: 'Chef Mario', role: 'chef' },
      staff: { id: 3, name: 'Staff Member', role: 'staff' },
    };
    setUser(userData[role]);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
