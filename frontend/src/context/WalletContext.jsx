import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchWalletBalance, depositFunds as apiDeposit } from '../api';
import { useAuth } from './AuthContext';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const { walletId } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshBalance = async () => {
    if (!walletId) {
      setBalance(0);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchWalletBalance(walletId);
      setBalance(data.balance);
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const deposit = async (amount) => {
    if (!walletId) return;
    await apiDeposit(amount, walletId);
    await refreshBalance();
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    refreshBalance();
  }, [walletId]);

  return (
    <WalletContext.Provider value={{ 
      balance, 
      loading, 
      refreshBalance, 
      deposit, 
      isModalOpen, 
      openModal, 
      closeModal 
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
}
