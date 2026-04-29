import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchOrder, simulatePayment, payWithWallet } from '../api';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { balance, refreshBalance } = useWallet();
  const { walletId } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    fetchOrder(sessionId)
      .then(setOrder)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleSimulatePayment = async () => {
    setProcessing(true);
    try {
      await simulatePayment(sessionId);
      navigate(`/result?session_id=${sessionId}`);
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const handleWalletPayment = async () => {
    if (!order || !walletId) return;
    setProcessing(true);
    try {
      const res = await payWithWallet(order.service_id, order.buyer_input, sessionId, walletId);
      await refreshBalance();
      navigate(`/result?session_id=${res.session_id}`);
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-[40px] p-10 text-center shadow-xl text-black">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-2xl font-black mb-4">Checkout Error</h2>
        <p className="text-gray-500 mb-8 font-medium">{error}</p>
        <button onClick={() => navigate('/')} className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all">Return to Home</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center py-20 px-4">
      
      {/* Locus Brand Header */}
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
         <div className="flex justify-center mb-4">
            <svg className="w-14 h-14 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L12 22M2 12L22 12M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" fillOpacity="0.1"/>
            </svg>
         </div>
         <h1 className="text-4xl font-black italic tracking-tighter text-black">LOCUS</h1>
      </div>

      <div className="w-full max-w-[500px] space-y-6 animate-in fade-in zoom-in duration-500">
        
        {/* Amount Card */}
        <div className="bg-white border border-gray-200 rounded-[32px] p-10 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Amount due</p>
                <h2 className="text-5xl font-black text-black tabular-nums">${order?.service?.price_usdc.toFixed(2)}</h2>
             </div>
             <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mr-2 animate-pulse" />
                  USDC on Base
                </span>
             </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100">
             <p className="text-xs font-bold text-gray-500 leading-relaxed italic">
                Execution of <span className="text-black">{order?.service?.name}</span> for {order?.buyer_input?.substring(0, 40)}...
             </p>
          </div>
        </div>

        {/* Payment Methods Card */}
        <div className="bg-white border border-gray-200 rounded-[32px] p-8 shadow-sm">
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 ml-1">Choose payment method</h3>
           
           <div className="space-y-4">
              {/* Pay with Locus (Simulated) */}
              <button 
                onClick={handleSimulatePayment}
                disabled={processing}
                className="w-full group flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-[24px] transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2L12 22M2 12L22 12M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="white" />
                      </svg>
                   </div>
                   <div className="text-left">
                      <p className="text-sm font-black text-black uppercase tracking-wide">Pay with Locus</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Login to pay instantly</p>
                   </div>
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Pay with AgentMart Wallet */}
              <button 
                onClick={handleWalletPayment}
                disabled={processing || balance < (order?.service?.price_usdc || 0)}
                className="w-full group flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-[24px] transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <span className="font-black text-lg">AM</span>
                   </div>
                   <div className="text-left">
                      <p className="text-sm font-black text-black uppercase tracking-wide">AgentMart Wallet</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Balance: {balance.toFixed(2)} USDC</p>
                   </div>
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* External Wallet */}
              <button 
                className="w-full group flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-[24px] transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 bg-white border border-gray-200 text-gray-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                   </div>
                   <div className="text-left">
                      <p className="text-sm font-black text-black uppercase tracking-wide">External Wallet</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">MetaMask, Coinbase, etc.</p>
                   </div>
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
           </div>
        </div>

        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
           Powered by Locus Protocol
        </p>
      </div>
    </div>
  );
}
