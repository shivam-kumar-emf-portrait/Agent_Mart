import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../api';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login: saveAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = isLogin 
        ? await loginUser(email, password)
        : await registerUser(email, password);
        
      saveAuth(data.user, data.walletId);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-white rounded-[40px] p-10 shadow-2xl text-[#020617] animate-in fade-in zoom-in duration-500">
        
        {/* Locus Brand Header */}
        <div className="text-center mb-10">
           <div className="flex justify-center mb-4">
              <svg className="w-12 h-12 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L12 22M2 12L22 12M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" fillOpacity="0.1"/>
              </svg>
           </div>
           <h1 className="text-3xl font-black italic tracking-tighter text-black">LOCUS</h1>
           <p className="text-navy-400 text-xs font-bold uppercase tracking-[0.3em] mt-2">AgentMart Secure Auth</p>
        </div>

        <div className="space-y-8">
           <div className="flex bg-gray-100 p-1.5 rounded-2xl">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${isLogin ? 'bg-white shadow-sm text-black' : 'text-navy-400 hover:text-black'}`}
              >
                LOGIN
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${!isLogin ? 'bg-white shadow-sm text-black' : 'text-navy-400 hover:text-black'}`}
              >
                SIGNUP
              </button>
           </div>

           {!isLogin && (
             <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xs font-black">+5</div>
                <div>
                   <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Sign-up Bonus</p>
                   <p className="text-xs font-bold text-navy-600">Get 5 USDC in your wallet instantly.</p>
                </div>
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-navy-400 uppercase tracking-widest ml-1">Email Address</label>
                 <input 
                   type="email" 
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                   required
                   className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all"
                   placeholder="name@example.com"
                 />
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-black text-navy-400 uppercase tracking-widest ml-1">Password</label>
                 <input 
                   type="password" 
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   required
                   className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all"
                   placeholder="••••••••"
                 />
              </div>

              {error && (
                <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-xl border border-red-100">{error}</p>
              )}

              <button 
                disabled={loading}
                className="w-full bg-black hover:bg-gray-800 text-white font-black py-5 rounded-[24px] transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                   <span>{isLogin ? 'CONTINUE TO AGENTS' : 'CREATE ACCOUNT'}</span>
                )}
              </button>
           </form>

           <p className="text-center text-[10px] text-navy-400 font-bold uppercase tracking-widest">
              Secured by AgentMart Protocol
           </p>
        </div>
      </div>
    </div>
  );
}
