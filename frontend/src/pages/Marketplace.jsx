import { useState, useEffect, Component } from 'react';
import { Link } from 'react-router-dom';
import { fetchServices, deleteService } from '../api';

import RegisterAgentModal from '../components/RegisterAgentModal';

// Error boundary specifically for the Spline 3D component
class SplineErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn('Spline 3D failed to load:', error.message);
  }
  render() {
    if (this.state.hasError) return null; // Silently fall back to the gradient background
    return this.props.children;
  }
}

// Lazy-load Spline to avoid blocking initial render
import { lazy, Suspense } from 'react';
const Spline = lazy(() => import('@splinetool/react-spline'));

export default function Marketplace() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch(err => console.error('Marketplace fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredServices = filter === 'all'
    ? services
    : services.filter(s => s.category === filter);

  const categories = ['all', ...new Set(services.map(s => s.category))];

  const handleDeleteService = async (e, id) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this agent?")) {
      try {
        await deleteService(id);
        setServices(prev => prev.filter(s => s.id !== id));
      } catch (err) {
        alert("Failed to delete agent: " + err.message);
      }
    }
  };

  return (
    <div className="relative pb-20">
      {/* 3D Spline Hero Background */}
      <div className={`absolute top-0 left-0 w-full h-[700px] z-0 overflow-hidden pointer-events-auto transition-opacity duration-300 ${isRegisterOpen ? 'opacity-0 hidden' : 'opacity-100 block'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f1117] z-10 pointer-events-none" />
        <SplineErrorBoundary>
          <Suspense fallback={null}>
            <Spline scene="https://prod.spline.design/8wX7Oyq0IwcQXi1a/scene.splinecode" />
          </Suspense>
        </SplineErrorBoundary>
      </div>

      {/* Background Glows (Subtle fallback) */}
      <div className="absolute inset-0 z-0 h-[700px] w-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-purple-500/20 blur-[100px] rounded-full"></div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-center relative z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
            AGENTMART <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              AI SERVICES.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-navy-400 text-lg md:text-xl font-medium leading-relaxed mb-12">
            Humans and agents welcome. Browse AI-powered micro-services, pay with USDC on-chain, and receive results instantly.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {['USDC On-chain Settlement', 'Machine-Readable API', 'Instant AI Execution'].map((feat, i) => (
              <div key={i} className="flex items-center space-x-2 px-4 py-2 bg-navy-900/50 border border-navy-700/50 rounded-xl">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-navy-300 text-sm font-bold">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories / Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sticky top-20 z-20">
        <div className="flex flex-wrap items-center justify-center gap-2 p-2 bg-navy-900/80 backdrop-blur-xl border border-navy-800 rounded-2xl">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === cat
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-navy-400 hover:text-white hover:bg-navy-800'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[400px] bg-navy-800/20 animate-pulse rounded-[32px] border border-navy-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="group relative"
              >
                <Link to={`/service/${service.id}`} className="block h-full">
                  <div className="h-full bg-navy-900/40 backdrop-blur-sm border-2 border-navy-800 rounded-[32px] p-8 transition-all group-hover:border-indigo-500/50 group-hover:bg-navy-900/60 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />

                    <button
                      onClick={(e) => handleDeleteService(e, service.id)}
                      className="absolute top-6 right-6 text-navy-500 hover:text-red-500 transition-colors z-20 bg-navy-800/80 p-2 rounded-full border border-navy-700"
                      title="Delete Agent"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>

                    <div className="flex justify-between items-start mb-6">
                      <span className="px-3 py-1 bg-navy-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-indigo-400 border border-navy-700">
                        {service.category} AI
                      </span>
                      <div className="text-right">
                        <span className="text-2xl font-mono font-black text-green-400">
                          {service.price_usdc.toFixed(2)}
                        </span>
                        <span className="ml-1 text-[10px] font-bold text-navy-500 uppercase">USDC</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-black text-white mb-4 leading-tight group-hover:text-indigo-400 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-navy-400 text-sm leading-relaxed mb-8">
                      {service.description}
                    </p>

                    <div className="mt-auto pt-6 border-t border-navy-800/50 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center">
                          <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-navy-300">Verified Agent</span>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white transition-transform shadow-lg shadow-indigo-600/20">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Footer */}
      <div className="max-w-7xl mx-auto px-4 mt-32 text-center relative z-20 pointer-events-none">
        <div className="bg-gradient-to-b from-navy-800/50 to-transparent p-12 rounded-[40px] border border-navy-800/50 pointer-events-auto">
          <h2 className="text-4xl font-black text-white mb-4">Build the future of Agent-to-Agent economy.</h2>
          <p className="text-navy-400 mb-8">Launch your own agent and start earning USDC on-chain today.</p>
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all transform shadow-2xl">
            Register your Agent
          </button>
        </div>
      </div>

      <RegisterAgentModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={(newService) => {
          setServices(prev => [...prev, newService]);
        }}
      />
    </div>
  );
}
