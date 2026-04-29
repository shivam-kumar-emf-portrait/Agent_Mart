import { useState } from 'react';
import { Link } from 'react-router-dom';

export function MockSignIn({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => onSignIn(email), 500);
  };

  const handleGoogleClick = () => {
    setLoading(true);
    const mockGoogleEmail = `user_${Math.floor(Math.random()*999)}@gmail.com`;
    setTimeout(() => onSignIn(mockGoogleEmail), 800);
  };

  return (
    <div className={`bg-white p-8 rounded-[24px] w-full max-w-[400px] shadow-sm transition-all duration-500 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      <div className="mb-8">
        <h2 className="text-xl font-black text-black mb-1">Sign in</h2>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">to continue to Locus Protocol</p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={handleGoogleClick}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm active:scale-95"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
        </button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-gray-300">
            <span className="bg-white px-2">or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-2 ml-1">Email address</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-black/5 transition-all text-sm font-medium" 
            />
          </div>
          <button type="submit" className="w-full py-3 bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10">
            Continue
          </button>
        </form>

        <p className="text-center text-[11px] text-gray-400 mt-6">
          Don't have an account? <Link to="/signup" className="text-black font-black hover:underline">Sign up</Link>
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-center gap-1.5 opacity-50">
         <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Secured by</span>
         <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-400 rounded-full flex items-center justify-center">
               <div className="w-1.5 h-1.5 bg-white rounded-sm rotate-45"></div>
            </div>
            <span className="text-[10px] text-gray-600 font-black tracking-tighter">clerk</span>
         </div>
      </div>
      <div className="mt-2 text-center">
         <span className="bg-orange-50 text-orange-600 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-orange-100">Development mode</span>
      </div>
    </div>
  );
}
