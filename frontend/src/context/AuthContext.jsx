import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [walletId, setWalletId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('am_user');
    const savedWalletId = localStorage.getItem('am_wallet_id');
    if (savedUser && savedWalletId) {
      setUser(JSON.parse(savedUser));
      setWalletId(savedWalletId);
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

  return (
    <AuthContext.Provider value={{ user, walletId, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
