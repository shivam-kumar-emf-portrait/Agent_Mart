import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchWalletBalance, depositFunds as apiDeposit } from '../api';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshBalance = async () => {
    try {
      const data = await fetchWalletBalance();
      setBalance(data.balance);
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const deposit = async (amount) => {
    await apiDeposit(amount);
    await refreshBalance();
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    refreshBalance();
  }, []);

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
