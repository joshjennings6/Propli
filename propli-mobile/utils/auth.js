import React, { createContext, useState } from 'react';

// Simple authentication context. Stores JWT token in memory.
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  // setter allows child components to update the token after login
  const saveToken = (t) => {
    setToken(t);
  };
  return (
    <AuthContext.Provider value={{ token, setToken: saveToken }}>
      {children}
    </AuthContext.Provider>
  );
};
