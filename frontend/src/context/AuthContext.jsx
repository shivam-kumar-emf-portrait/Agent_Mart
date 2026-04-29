import { createContext, useContext, useState, useEffect } from 'react';
import { syncUser } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [walletId, setWalletId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for mock/cached user
    const savedUser = localStorage.getItem('am_user');
    const savedWalletId = localStorage.getItem('am_wallet_id');
    if (savedUser && savedWalletId) {
      try {
        setUser(JSON.parse(savedUser));
        setWalletId(savedWalletId);
      } catch (e) {
        localStorage.removeItem('am_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, wId) => {
    setUser(userData);
    setWalletId(wId);
    localStorage.setItem('am_user', JSON.stringify(userData));
    localStorage.setItem('am_wallet_id', wId);
  };

  const logout = () => {
    setUser(null);
    setWalletId(null);
    localStorage.removeItem('am_user');
    localStorage.removeItem('am_wallet_id');
  };

  const mockLogin = async (email) => {
    try {
      const data = await syncUser(email);
      login(data.user, data.walletId);
      return data;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, walletId, login, logout, mockLogin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
