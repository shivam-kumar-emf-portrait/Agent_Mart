import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchService, createCheckout, deleteService } from '../api';

const CodeSnippet = ({ serviceId, inputSchema }) => {
  const [activeTab, setActiveTab] = useState('js');
  
  const exampleInput = Object.keys(inputSchema).reduce((acc, key) => {
    acc[key] = "example_value";
    return acc;
  }, {});

  const snippets = {
    curl: `curl -X POST https://agentmart.api/v1/checkout/create \\
  -H "Content-Type: application/json" \\
  -d '{
    "service_id": "${serviceId}",
    "buyer_input": ${JSON.stringify(exampleInput)}
  }'`,
    js: `const response = await fetch('https://agentmart.api/v1/checkout/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    service_id: '${serviceId}',
    buyer_input: ${JSON.stringify(exampleInput)}
  })
});

const { checkout_url } = await response.json();
window.location.href = checkout_url;`,
    python: `import requests

payload = {
    "service_id": "${serviceId}",
    "buyer_input": ${JSON.stringify(exampleInput)}
}

response = requests.post("https://agentmart.api/v1/checkout/create", json=payload)
print(response.json()["checkout_url"])`
  };

  return (
    <div className="mt-12 bg-black/40 border border-navy-800 rounded-[32px] overflow-hidden">
      <div className="flex border-b border-navy-800 bg-navy-900/50">
        {['js', 'python', 'curl'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'text-indigo-400 bg-indigo-500/5 border-b-2 border-indigo-500' : 'text-navy-500 hover:text-navy-300'
            }`}
          >
            {tab === 'js' ? 'JavaScript' : tab === 'python' ? 'Python' : 'cURL'}
          </button>
        ))}
      </div>
      <div className="p-8 font-mono text-sm overflow-x-auto">
        <pre className="text-navy-300 leading-relaxed whitespace-pre">
          {snippets[activeTab]}
        </pre>
      </div>
    </div>
  );
};

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchService(id)
      .then(setService)
      .catch(err => console.error(err))
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

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this agent?")) {
      try {
        await deleteService(id);
        navigate('/');
      } catch (error) {
        alert('Failed to delete: ' + error.message);
      }
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto py-20 px-4 text-center">
      <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
    </div>
  );

  if (!service) return <div className="text-white text-center py-20 font-black">AGENT NOT FOUND</div>;

  const parsedSchema = typeof service.input_schema === 'string' ? JSON.parse(service.input_schema) : service.input_schema;

  return (
    <div className="max-w-5xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-3 gap-12">
        {/* Left: Info */}
        <div className="md:col-span-1 space-y-8">
          <div className="bg-navy-900/50 border border-navy-800 rounded-[32px] p-8 relative">
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest inline-block">
                Agent Profile
              </span>
              <button 
                onClick={handleDelete}
                className="text-navy-500 hover:text-red-500 transition-colors bg-navy-800/80 p-2 rounded-full border border-navy-700"
                title="Delete Agent"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
            <h1 className="text-4xl font-black text-white mb-4 leading-none">{service.name}</h1>
            <p className="text-navy-400 text-sm leading-relaxed mb-8">{service.description}</p>
            
            <div className="pt-6 border-t border-navy-800 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-navy-500 font-bold uppercase">Price</span>
                <span className="text-xl font-mono font-black text-green-400">{service.price_usdc} USDC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-navy-500 font-bold uppercase">Category</span>
                <span className="text-xs font-bold text-white uppercase tracking-widest">{service.category}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-navy-900/50 border border-navy-800 rounded-[32px] p-8">
            <h4 className="text-white font-bold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04c0 4.833 1.277 9.473 3.444 13.528L12 21.944l5.174-2.432a11.954 11.954 0 003.444-13.528z" />
              </svg>
              Verification
            </h4>
            <p className="text-navy-400 text-xs leading-relaxed">
              Cryptographically signed outputs for high-trust environments.
            </p>
          </div>
        </div>

        {/* Right: Form & Code */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-navy-900/50 border border-navy-800 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
            <h2 className="text-3xl font-black text-white mb-8">Execute Task</h2>
            
            <div className="space-y-8">
              {Object.keys(parsedSchema).map(key => (
                <div key={key}>
                  <label className="block text-navy-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                    {key.replace('_', ' ')}
                  </label>
                  {parsedSchema[key].includes('string') ? (
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
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-3"
              >
                <span>Deploy Agent Task</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </div>
          </form>

          {/* New API Snippet Section */}
          <div className="mt-12">
            <h3 className="text-white font-black text-xl mb-4">Integration for Developers</h3>
            <p className="text-navy-400 text-sm mb-6">Integrate this agent directly into your application using our headless API.</p>
            <CodeSnippet serviceId={id} inputSchema={parsedSchema} />
          </div>
        </div>
      </div>
    </div>
  );
}
