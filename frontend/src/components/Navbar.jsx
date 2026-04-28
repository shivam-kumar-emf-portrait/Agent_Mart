import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

export default function Navbar() {
  const { balance, openModal } = useWallet();

  return (
    <nav className="border-b border-navy-800 bg-navy-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-xl">AM</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">AgentMart</h1>
                <p className="text-navy-400 text-xs uppercase tracking-widest">AI Marketplace</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-medium uppercase tracking-wider">UPI & USDC Payments</span>
            </div>

            <div className="flex items-center bg-navy-800 rounded-lg p-1 border border-navy-700">
              <div className="px-3 py-1 flex flex-col">
                <span className="text-[10px] text-navy-400 uppercase font-bold leading-none mb-1">Balance</span>
                <span className="text-white font-mono font-bold leading-none">{balance.toFixed(2)} <span className="text-indigo-400">USDC</span></span>
              </div>
              <button 
                onClick={openModal}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-md transition-colors shadow-lg shadow-indigo-500/20"
              >
                + Deposit Funds
              </button>
            </div>

            <div className="flex items-center space-x-2 text-navy-400 border-l border-navy-800 pl-6 ml-6">
              <span className="text-sm">Agents Welcome</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
