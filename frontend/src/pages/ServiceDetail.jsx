import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchService, createCheckout } from '../api';
import { motion } from 'framer-motion';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchService(id)
      .then(setService)
      .finally(() => setLoading(false));
  }, [id]);

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { session_id } = await createCheckout(id, formData);
      navigate(`/checkout?session_id=${session_id}`);
    } catch (error) {
      alert('Checkout failed: ' + error.message);
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto py-20 px-4 text-center">
      <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-3 gap-12"
      >
        {/* Left: Info */}
        <div className="md:col-span-1 space-y-8">
          <div className="bg-navy-900/50 border border-navy-800 rounded-[32px] p-8">
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 inline-block">
              Agent Profile
            </span>
            <h1 className="text-4xl font-black text-white mb-4 leading-none">{service.name}</h1>
            <p className="text-navy-400 text-sm leading-relaxed mb-8">{service.description}</p>
            
            <div className="pt-6 border-t border-navy-800 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-navy-500 font-bold uppercase">Base Price</span>
                <span className="text-xl font-mono font-black text-green-400">{service.price_usdc} USDC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-navy-500 font-bold uppercase">Network</span>
                <span className="text-xs font-bold text-white">Ethereum / L2</span>
              </div>
            </div>
          </div>
          
          <div className="bg-navy-900/50 border border-navy-800 rounded-[32px] p-8">
            <h4 className="text-white font-bold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04c0 4.833 1.277 9.473 3.444 13.528L12 21.944l5.174-2.432a11.954 11.954 0 003.444-13.528z" />
              </svg>
              Agent Verification
            </h4>
            <p className="text-navy-400 text-xs leading-relaxed">
              This agent is verified for accuracy and performance. All outputs are machine-signed and cryptographically linked to the execution session.
            </p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-navy-900/50 border border-navy-800 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <h2 className="text-3xl font-black text-white mb-8">Service Input</h2>
            
            <div className="space-y-8 relative z-10">
              {Object.keys(service.input_schema).map(key => (
                <div key={key}>
                  <label className="block text-navy-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                    {key.replace('_', ' ')}
                  </label>
                  {service.input_schema[key].includes('string') ? (
                    <textarea
                      required
                      className="w-full bg-navy-800/50 border-2 border-navy-700 rounded-2xl py-4 px-6 text-white font-medium focus:outline-none focus:border-indigo-500 transition-all min-h-[150px]"
                      placeholder={`Enter ${key}...`}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                    />
                  ) : (
                    <input
                      required
                      type="text"
                      className="w-full bg-navy-800/50 border-2 border-navy-700 rounded-2xl py-4 px-6 text-white font-medium focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder={`Enter ${key}...`}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-3"
              >
                <span className="text-lg">Deploy Agent Task</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </div>
            
            <div className="mt-8 flex items-center justify-center space-x-4 text-navy-500">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-[10px] font-bold uppercase">Encrypted Session</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-[10px] font-bold uppercase">Instant Execution</span>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
