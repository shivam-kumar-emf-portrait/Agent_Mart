import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchOrder } from '../api';
import confetti from 'canvas-confetti';

export default function ResultPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    const poll = setInterval(() => {
      fetchOrder(sessionId)
        .then(data => {
          setOrder(data);
          if (data.status === 'completed' || data.status === 'failed') {
            clearInterval(poll);
            setLoading(false);
            if (data.status === 'completed') {
              confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#4f46e5', '#8b5cf6', '#ec4899']
              });
            }
          }
        })
        .catch(err => {
          clearInterval(poll);
          setError(err.message);
          setLoading(false);
        });
    }, 2000);

    return () => clearInterval(poll);
  }, [sessionId]);

  const renderFormattedResult = (result) => {
    if (!result) return null;
    
    let data = result;
    if (typeof result === 'string') {
      try {
        data = JSON.parse(result);
      } catch (e) {
        return <div className="bg-navy-900/80 border border-navy-700/50 rounded-3xl p-8 text-white font-mono whitespace-pre-wrap">{result}</div>;
      }
    }

    return (
      <div className="space-y-6">
        {/* Quality Score Section */}
        {data.score !== undefined && (
          <div className="bg-navy-900/80 border border-navy-700/50 rounded-3xl p-8 flex items-center justify-between">
            <div>
              <h3 className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-1">QUALITY SCORE</h3>
              <p className="text-navy-400 text-sm">Overall assessment of the task</p>
            </div>
            <div className="w-24 h-24 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-yellow-500 leading-none">{data.score}</span>
              <span className="text-navy-500 text-[10px] font-bold mt-1">/ 10</span>
            </div>
          </div>
        )}

        {/* Review / Summary Section */}
        {(data.review || data.summary) && (
          <div className="bg-navy-900/80 border border-navy-700/50 rounded-3xl p-8">
            <h3 className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              REVIEW
            </h3>
            <p className="text-navy-200 text-base md:text-lg leading-relaxed">
              {data.review || data.summary}
            </p>
          </div>
        )}

        {/* Issues Section */}
        {(data.issues || data.vulnerabilities) && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8">
            <h3 className="text-red-400 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              ISSUES FOUND ({(data.issues || data.vulnerabilities).length})
            </h3>
            <ul className="space-y-4">
              {(data.issues || data.vulnerabilities).map((item, i) => (
                <li key={i} className="flex items-start text-navy-200">
                  <span className="text-red-500 mr-4 mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"></span>
                  <span className="text-sm md:text-base">{typeof item === 'string' ? item : (item.description || JSON.stringify(item))}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements Section */}
        {data.improvements && (
          <div className="bg-green-500/5 border border-green-500/20 rounded-3xl p-8">
            <h3 className="text-green-400 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              IMPROVEMENTS
            </h3>
            <ul className="space-y-4">
              {data.improvements.map((item, i) => (
                <li key={i} className="flex items-start text-navy-200">
                  <span className="text-green-500 mr-4 mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"></span>
                  <span className="text-sm md:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Key Points Section */}
        {data.key_points && (
          <div className="bg-navy-900/80 border border-navy-700/50 rounded-3xl p-8">
            <h3 className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              KEY TAKEAWAYS
            </h3>
            <ul className="space-y-4">
              {data.key_points.map((item, i) => (
                <li key={i} className="flex items-start text-navy-200">
                  <span className="text-indigo-500 mr-4 mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"></span>
                  <span className="text-sm md:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Code / Content Section */}
        {(data.sql_query || data.optimized_article || data.concepts) && (
          <div className="bg-black/50 border border-navy-800 rounded-3xl p-8">
            <h3 className="text-navy-500 text-xs font-black uppercase tracking-widest mb-6">TECHNICAL DATA</h3>
            <pre className="text-green-400 font-mono text-sm overflow-x-auto leading-relaxed">
              {data.sql_query || data.optimized_article || JSON.stringify(data.concepts, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  if (loading && !order) return (
    <div className="max-w-3xl mx-auto py-20 px-4 text-center">
      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-8 animate-spin" />
      <h2 className="text-2xl font-black text-white mb-2">Connecting to Agent...</h2>
      <p className="text-navy-400">Allocating high-speed compute resources.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
      {loading ? (
        <div className="bg-navy-900/50 border border-navy-800 rounded-[40px] p-12 text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative w-full h-full border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Agent is Processing...</h2>
          <p className="text-navy-400 text-lg italic">"Cerebras inference in action"</p>
        </div>
      ) : order.status === 'completed' ? (
        <div className="animate-in fade-in zoom-in-95 duration-500">
           <div className="mb-10 flex items-center justify-between">
              <h1 className="text-4xl font-black text-white tracking-tighter">Your Results</h1>
              <span className="text-navy-500 font-mono text-[10px] uppercase">ID: {sessionId}</span>
           </div>

           <div className="space-y-6 mb-12">
             {renderFormattedResult(order.result)}
           </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="bg-navy-900 border border-navy-700 hover:bg-navy-800 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all"
            >
              Close Result
            </button>
            <button 
              className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-2xl hover:bg-indigo-600 hover:text-white"
              onClick={() => window.print()}
            >
              Export to PDF
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-red-500/10 border border-red-500/20 rounded-[40px] p-12 text-center">
           <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
             <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
           </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Agent Error</h2>
          <p className="text-red-400 font-medium mb-8 max-w-md mx-auto">
            {typeof order.result === 'string' ? order.result : (order.result?.error || 'Compute error detected.')}
          </p>
          <button onClick={() => navigate('/')} className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors">Go Back</button>
        </div>
      )}
    </div>
  );
}
