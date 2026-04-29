import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchOrder, simulatePayment, payWithWallet } from '../api';
import { useWallet } from '../context/WalletContext';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { balance, refreshBalance } = useWallet();
  
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
    if (!order) return;
    setProcessing(true);
    try {
      const res = await payWithWallet(order.service_id, order.buyer_input, sessionId);
      await refreshBalance();
      navigate(`/result?session_id=${res.session_id}`);
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto py-20 px-4 text-center">
      <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-navy-400">Loading checkout session...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-white font-bold text-lg mb-2">Checkout Error</h2>
        <p className="text-navy-400 mb-6">{error}</p>
        <button onClick={() => navigate('/')} className="text-indigo-400 hover:text-indigo-300 font-bold">Return to Marketplace</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-navy-800/50 border border-navy-700 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-navy-700">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Pay with USDC</h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-500 text-xs font-bold uppercase tracking-widest">Secured</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-navy-400 text-sm uppercase font-bold mb-1">Total</p>
              <p className="text-4xl font-mono font-bold text-green-400">{order?.service?.price_usdc.toFixed(2)} <span className="text-xl">USDC</span></p>
            </div>
          </div>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8">
          {/* Option 1: External Wallet (Locus) */}
          <div className="space-y-6">
            <div className="bg-navy-900/50 border border-navy-700 rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 group-hover:bg-indigo-500/10 transition-colors"></div>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-navy-800 rounded-xl flex items-center justify-center border border-navy-700">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold">Locus Checkout</h3>
                  <p className="text-navy-400 text-xs">Connect wallet → Approve USDC → Confirm</p>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {['On-chain settlement via USDC ERC-20', 'Non-custodial — funds go directly to seller', 'AI task runs automatically after confirmation'].map((feat, i) => (
                  <li key={i} className="flex items-center space-x-3 text-sm text-navy-300">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-black/20 rounded-lg p-3 font-mono text-[10px] text-navy-500 mb-6">
                session: {sessionId}
              </div>

              <button
                onClick={handleSimulatePayment}
                disabled={processing}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{processing ? 'Processing...' : `Simulate Locus Payment — ${order?.service?.price_usdc.toFixed(2)} USDC`}</span>
              </button>
            </div>
          </div>

          {/* Option 2: AgentMart Wallet */}
          <div className="space-y-6">
            <div className="bg-navy-900/50 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-12 -mt-12 group-hover:bg-green-500/10 transition-colors"></div>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-navy-800 rounded-xl flex items-center justify-center border border-navy-700">
                  <span className="text-white font-bold text-xl">AM</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">AgentMart Wallet</h3>
                  <p className="text-navy-400 text-xs">Pay instantly from your account balance</p>
                </div>
              </div>

              <div className="mb-8 p-4 bg-navy-800/50 rounded-lg border border-navy-700">
                <p className="text-navy-400 text-xs uppercase font-bold mb-1">Your Balance</p>
                <p className="text-2xl font-mono font-bold text-white">{balance.toFixed(2)} <span className="text-indigo-400 text-sm">USDC</span></p>
                {balance < (order?.service?.price_usdc || 0) && (
                  <p className="text-red-400 text-[10px] mt-2 font-bold flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Insufficient balance
                  </p>
                )}
              </div>

              <button
                onClick={handleWalletPayment}
                disabled={processing || balance < (order?.service?.price_usdc || 0)}
                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 shadow-xl shadow-green-500/20 transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{processing ? 'Processing...' : 'Pay from AM Wallet'}</span>
              </button>
              
              <p className="mt-4 text-center text-navy-400 text-[10px]">
                One-click payment for authorized agents
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-navy-900/50 border-t border-navy-700 flex items-center space-x-3">
          <div className="w-8 h-8 bg-navy-800 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-white text-xs font-bold">Demo Mode</h4>
            <p className="text-navy-500 text-[10px]">Both payment methods will trigger the AI task simulation for this hackathon demo.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
