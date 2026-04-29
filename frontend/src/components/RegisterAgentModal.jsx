import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { registerService } from '../api';

export default function RegisterAgentModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'text',
    price_usdc: 1.0,
    input_schema: '{\n  "input_text": "string"\n}',
    output_schema: '{\n  "result": "string"\n}',
    seller_wallet: '0xNewAgentWallet'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Basic JSON validation before sending
      JSON.parse(formData.input_schema);
      JSON.parse(formData.output_schema);

      const newService = await registerService(formData);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(newService);
        onClose();
        setIsSuccess(false);
      }, 2000);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON in schema fields.');
      } else {
        setError(err.message || 'Failed to register agent.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0f1117]/95"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-navy-900 border border-indigo-500/30 rounded-3xl shadow-2xl shadow-indigo-500/20 p-8"
          >
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center border-4 border-green-500">
                  <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black text-white">Agent Deployed!</h3>
                <p className="text-navy-300">Your agent is now live on the AgentMart network.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-white">Register AI Agent</h2>
                    <p className="text-navy-400 text-sm mt-1">Deploy your agent to the AgentMart testnet.</p>
                  </div>
                  <button onClick={onClose} className="text-navy-400 hover:text-white p-2 rounded-full hover:bg-navy-800 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-navy-300 uppercase tracking-wider mb-2">Agent Name</label>
                      <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Code Reviewer Bot" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-navy-300 uppercase tracking-wider mb-2">Category</label>
                      <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none">
                        {['text', 'code', 'data', 'web3', 'legal', 'marketing', 'social', 'career', 'health', 'design', 'security', 'chain'].map(cat => (
                          <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-300 uppercase tracking-wider mb-2">Description</label>
                    <textarea required name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none" placeholder="What does your agent do?" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-navy-300 uppercase tracking-wider mb-2">Price (USDC)</label>
                      <input required type="number" step="0.01" min="0" name="price_usdc" value={formData.price_usdc} onChange={handleChange} className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-green-400 font-mono focus:outline-none focus:border-indigo-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-navy-300 uppercase tracking-wider mb-2">Seller Wallet Address</label>
                      <input required name="seller_wallet" value={formData.seller_wallet} onChange={handleChange} className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-navy-300 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-navy-300 uppercase tracking-wider mb-2">Input Schema (JSON)</label>
                      <textarea required name="input_schema" value={formData.input_schema} onChange={handleChange} rows={4} className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-indigo-300 font-mono text-xs focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-navy-300 uppercase tracking-wider mb-2">Output Schema (JSON)</label>
                      <textarea required name="output_schema" value={formData.output_schema} onChange={handleChange} rows={4} className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-indigo-300 font-mono text-xs focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-navy-800 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-navy-300 hover:text-white hover:bg-navy-800 transition-colors">
                      CANCEL
                    </button>
                    <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center min-w-[160px]">
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'DEPLOY AGENT'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
