// src/AuthProvider.jsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { BASE_URL } from './config';

axios.defaults.withCredentials = true;

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // AuthProvider.jsx
useEffect(() => {
  const verifyAuth = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/get-current-user`);

      if (res.status === 200 && res.data.user) {
        setIsAuthenticated(true);

        // Normalize the user object to include profileImage
        setUser({
          ...res.data.user,
          isGuest: res.data.user.isGuest === true,
        });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  verifyAuth();
}, []);


  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;