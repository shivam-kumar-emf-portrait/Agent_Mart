import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Marketplace from './pages/Marketplace.jsx';
import ServiceDetail from './pages/ServiceDetail.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ResultPage from './pages/ResultPage.jsx';
import Activity from './pages/Activity.jsx';
import { WalletProvider, useWallet } from './context/WalletContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import DepositModal from './components/DepositModal.jsx';
import LoginPage from './pages/LoginPage.jsx';

function AppContent() {
  const { isModalOpen, closeModal } = useWallet();
  
  return (
    <div className="min-h-screen bg-[#020617] font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      <Navbar />
      
      <main>
        <Routes>
          <Route path="/" element={<Marketplace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/activity" element={<Activity />} />
        </Routes>
      </main>
      
      <DepositModal isOpen={isModalOpen} onClose={closeModal} />
      
      {/* Global Ambient Glow */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[150px] -z-20 pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 blur-[150px] -z-20 pointer-events-none"></div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </AuthProvider>
  );
}
