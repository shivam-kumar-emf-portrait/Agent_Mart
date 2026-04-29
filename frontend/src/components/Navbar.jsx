import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { balance, openModal } = useWallet();
  const { user, logout } = useAuth();

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
            <div className="hidden lg:flex items-center space-x-6 border-l border-navy-800 pl-6 h-10">
              <Link to="/activity" className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-400 hover:text-indigo-400 transition-colors flex items-center">
                Live Activity
                <span className="ml-2 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {user && (
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
            )}

            <div className="flex items-center space-x-4 border-l border-navy-800 pl-6">
              {user ? (
                <div className="flex items-center gap-3">
                   <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-black text-white uppercase tracking-wider">{(user.email || '').split('@')[0]}</p>
                      <button onClick={logout} className="text-[9px] font-bold text-navy-400 hover:text-red-400 uppercase tracking-[0.1em]">Sign Out</button>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border border-navy-700"></div>
                </div>
              ) : (
                <Link to="/login" className="bg-white text-black px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                   Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
