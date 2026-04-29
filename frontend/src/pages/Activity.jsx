import { useState, useEffect } from 'react';
import { fetchRecentActivity } from '../api';
import { Link } from 'react-router-dom';

export default function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      fetchRecentActivity()
        .then(setActivities)
        .finally(() => setLoading(false));
    };

    load();
    const interval = setInterval(load, 5000); // Refresh every 5s for "Live" feel
    return () => clearInterval(interval);
  }, []);

  const totalVolume = activities.reduce((sum, item) => sum + (item.price_usdc || 0), 0);

  return (
    <div className="max-w-6xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">
            Network Status: Live
          </span>
          <h1 className="text-5xl font-black text-white tracking-tighter">NETWORK ACTIVITY</h1>
          <p className="text-navy-400 mt-2">Real-time settlement and execution logs from the AgentMart protocol.</p>
        </div>
        
        <div className="flex gap-8">
          <div className="text-center md:text-right">
            <div className="text-2xl font-black text-white">{activities.length}</div>
            <div className="text-[10px] font-bold text-navy-500 uppercase tracking-widest">Tasks Executed</div>
          </div>
          <div className="text-center md:text-right">
            <div className="text-2xl font-black text-green-400">{totalVolume.toFixed(2)}</div>
            <div className="text-[10px] font-bold text-navy-500 uppercase tracking-widest">USDC Volume</div>
          </div>
        </div>
      </div>

      <div className="bg-navy-900/50 border border-navy-800 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-navy-800 bg-navy-900/80">
                <th className="px-8 py-6 text-[10px] font-black text-navy-500 uppercase tracking-widest">Session ID / Agent</th>
                <th className="px-8 py-6 text-[10px] font-black text-navy-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-navy-500 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black text-navy-500 uppercase tracking-widest">Time</th>
                <th className="px-8 py-6 text-[10px] font-black text-navy-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/50">
              {loading && activities.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-navy-500 font-bold uppercase tracking-widest">
                    Synchronizing with Network...
                  </td>
                </tr>
              ) : activities.map((item) => (
                <tr key={item.session_id} className="hover:bg-indigo-500/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-mono text-xs text-indigo-400 mb-1">{item.session_id.substring(0, 18)}...</div>
                    <div className="text-white font-black text-sm uppercase">{item.service_name}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      item.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      item.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-white font-mono font-bold">{(item.price_usdc || 0).toFixed(2)} <span className="text-[10px] text-navy-500">USDC</span></div>
                  </td>
                  <td className="px-8 py-6 text-navy-400 text-xs font-medium">
                    {new Date(item.created_at).toLocaleTimeString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link 
                      to={`/result?session_id=${item.session_id}`}
                      className="inline-flex items-center space-x-2 text-indigo-400 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors"
                    >
                      <span>View Log</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
