import { useState } from 'react';
import { useWallet } from '../context/WalletContext';

export default function DepositModal({ isOpen, onClose }) {
  const { deposit } = useWallet();
  const [step, setStep] = useState('amount'); // amount, upi, success, receipt
  const [amount, setAmount] = useState('10');
  const [loading, setLoading] = useState(false);
  const [txId, setTxId] = useState('');

  const handleStartUPI = () => setStep('upi');

  const handleSimulateUPI = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    try {
      const generatedTxId = 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase();
      setTxId(generatedTxId);
      await deposit(parseFloat(amount));
      setStep('success');
    } catch (error) {
      alert('Deposit failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep('amount');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop - High Opacity for focus */}
      <div 
        className="fixed inset-0 bg-[#020617]/95 backdrop-blur-xl animate-in fade-in duration-500" 
        onClick={resetAndClose}
      ></div>
      
      {/* Modal Content - Centered Perfectly with flex */}
      <div className="bg-[#0B0F1A] border border-navy-700 w-full max-w-[420px] rounded-[32px] shadow-[0_0_100px_rgba(79,70,229,0.2)] relative z-[10000] animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500 overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/10 blur-[100px] -z-10"></div>

        {/* Header */}
        <div className="px-8 py-6 border-b border-navy-800/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {step === 'receipt' ? 'Receipt' : 'Add Funds'}
            </h2>
            <p className="text-navy-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">AgentMart Wallet</p>
          </div>
          <button 
            onClick={resetAndClose} 
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-navy-800 text-navy-400 hover:text-white hover:bg-navy-700 transition-all active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body - Max height with scroll if needed */}
        <div className="p-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
          {step === 'amount' && (
            <div className="space-y-10 py-4">
              <div className="text-center relative">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent text-white text-center font-mono text-7xl font-bold focus:outline-none placeholder-navy-800 leading-none"
                  placeholder="0"
                  autoFocus
                />
                <p className="text-indigo-400 font-black mt-4 text-sm uppercase tracking-[0.3em]">USDC Token</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {['5', '10', '25'].map(val => (
                  <button 
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`py-4 rounded-2xl border-2 font-bold transition-all ${amount === val ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/30 scale-[1.05]' : 'bg-navy-800/30 border-navy-700/50 text-navy-400 hover:border-navy-500 hover:bg-navy-800/50'}`}
                  >
                    ${val}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleStartUPI}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5 rounded-2xl shadow-2xl shadow-indigo-600/40 transition-all flex items-center justify-center space-x-3 active:scale-[0.97]"
              >
                <span className="text-lg">Continue to UPI</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          )}

          {step === 'upi' && (
            <div className="text-center space-y-8 animate-in fade-in zoom-in duration-300">
              <div className="space-y-2">
                <h3 className="text-white font-bold text-xl">Scan to Pay</h3>
                <p className="text-navy-400 text-sm">Amount due: <span className="text-white font-bold font-mono">${amount}</span></p>
              </div>

              <div className="relative mx-auto w-[200px]">
                <div className="absolute inset-0 bg-indigo-500/20 blur-[40px] rounded-full"></div>
                <div className="relative bg-white p-5 rounded-[32px] shadow-2xl overflow-hidden">
                  <img 
                    src="/upi-qr-placeholder.png" 
                    alt="UPI QR" 
                    className="w-full h-full object-contain aspect-square" 
                  />
                </div>
              </div>

              <div className="bg-navy-800/50 rounded-2xl p-5 border border-navy-700/50 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-navy-500 text-[10px] uppercase font-bold tracking-widest mb-1">UPI ID</p>
                  <p className="text-white text-sm font-mono font-bold">agentmart@upi</p>
                </div>
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleSimulateUPI}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-5 rounded-2xl shadow-2xl shadow-green-600/30 transition-all flex items-center justify-center space-x-3 active:scale-[0.97]"
                >
                  {loading ? (
                    <div className="animate-spin w-6 h-6 border-4 border-white border-t-transparent rounded-full" />
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span className="text-lg">{loading ? 'Verifying...' : 'Confirm Payment'}</span>
                </button>
                <button 
                  onClick={() => setStep('amount')} 
                  className="text-navy-500 hover:text-white text-sm font-bold transition-colors underline underline-offset-4 decoration-navy-800"
                >
                  Change Amount
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-10 space-y-10 animate-in fade-in zoom-in duration-500">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-green-500 blur-[60px] opacity-20 animate-pulse"></div>
                <div className="relative w-28 h-28 bg-green-500/10 border-2 border-green-500/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                  <svg className="w-14 h-14 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-4xl font-bold text-white">Payment Received</h3>
                <p className="text-navy-400 text-lg leading-relaxed">
                  <span className="text-white font-bold">{amount} USDC</span> has been credited.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <button 
                  onClick={() => setStep('receipt')}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5 rounded-2xl shadow-2xl shadow-indigo-600/30 transition-all"
                >
                  Download Receipt
                </button>
                <button onClick={resetAndClose} className="w-full py-2 text-navy-500 hover:text-navy-300 text-sm font-bold">Back to Marketplace</button>
              </div>
            </div>
          )}

          {step === 'receipt' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-500">
              <div className="bg-white rounded-[32px] p-8 text-[#020617] shadow-2xl relative overflow-hidden">
                {/* Receipt watermark */}
                <div className="absolute -bottom-10 -left-10 text-[120px] font-black text-indigo-500/5 select-none pointer-events-none -rotate-12">PAID</div>
                
                <div className="flex justify-between items-start mb-10 border-b border-navy-100 pb-6">
                  <div>
                    <h4 className="font-black text-2xl italic tracking-tighter text-indigo-600 leading-none">AM</h4>
                    <p className="text-[10px] text-navy-400 font-bold uppercase tracking-[0.3em] mt-2">Official Receipt</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-navy-400 font-bold uppercase tracking-widest mb-1">Date</p>
                    <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-navy-400 font-bold uppercase tracking-widest">Description</span>
                    <span className="text-xs font-bold">Wallet Top-up</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-navy-400 font-bold uppercase tracking-widest">Transaction Ref</span>
                    <span className="text-xs font-mono font-bold text-indigo-600">{txId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-navy-400 font-bold uppercase tracking-widest">Payment Status</span>
                    <span className="text-[10px] bg-green-500 text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider">Confirmed</span>
                  </div>
                </div>

                <div className="border-t-2 border-dashed border-navy-100 pt-8 mb-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-navy-400 font-bold uppercase tracking-[0.2em] mb-1">Total Credit</p>
                      <p className="text-4xl font-mono font-black text-indigo-600">{amount} <span className="text-lg">USDC</span></p>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <p className="text-[9px] text-navy-400 font-bold uppercase tracking-[0.2em]">Verified by AgentMart Protocol</p>
                </div>
              </div>

              <button 
                onClick={resetAndClose}
                className="w-full bg-navy-900 hover:bg-black text-white font-bold py-5 rounded-2xl transition-all border border-navy-800 active:scale-[0.97] shadow-xl"
              >
                Close Statement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
