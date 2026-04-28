import { useNavigate } from 'react-router-dom';
import AgentBadge from './AgentBadge.jsx';

const categoryBorderClass = {
  text: 'border-accent-text',
  code: 'border-accent-code',
  data: 'border-accent-data',
};

const categoryGlowClass = {
  text: 'hover:shadow-violet-900/20',
  code: 'hover:shadow-blue-900/20',
  data: 'hover:shadow-green-900/20',
};

export default function ServiceCard({ service }) {
  const navigate = useNavigate();
  const borderClass = categoryBorderClass[service.category] || 'border-accent-text';
  const glowClass = categoryGlowClass[service.category] || 'hover:shadow-violet-900/20';

  return (
    <div
      className={`card card-hover ${borderClass} ${glowClass} flex flex-col animate-fade-in cursor-pointer`}
      onClick={() => navigate(`/service/${service.id}`)}
    >
      <div className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <AgentBadge category={service.category} />
          <span className="price-tag text-lg">
            {service.price_usdc.toFixed(2)} USDC
          </span>
        </div>

        {/* Title */}
        <h3 className="text-white font-bold text-lg mb-2 leading-snug">
          {service.name}
        </h3>

        {/* Description */}
        <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-5">
          {service.description}
        </p>

        {/* Schema preview */}
        <div className="mb-5 p-3 rounded-lg bg-navy-900/60 border border-slate-800">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Input</div>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(service.input_schema).map(key => (
              <span key={key} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-xs font-mono">
                {key}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          className="btn-primary w-full justify-center group"
          onClick={(e) => { e.stopPropagation(); navigate(`/service/${service.id}`); }}
        >
          Buy this service
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
