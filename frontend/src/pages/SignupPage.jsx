import { MockSignIn } from "../components/MockClerk";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const { mockLogin } = useAuth();
  const navigate = useNavigate();

  const handleMockSignUp = async (email) => {
    try {
      await mockLogin(email);
      navigate('/');
    } catch (err) {
      alert("Signup failed: " + err.message);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
         <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-black text-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-black/20">
               <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                 <path d="M12 2L12 22M2 12L22 12M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" fillOpacity="0.1"/>
               </svg>
            </div>
         </div>
         <h1 className="text-5xl font-black italic tracking-tighter text-black mb-2">LOCUS</h1>
         <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.4em]">Create Protocol Account</p>
      </div>

      <div className="shadow-2xl rounded-[32px] overflow-hidden border border-white/20 scale-110">
        <MockSignIn onSignIn={handleMockSignUp} />
      </div>

      <div className="mt-12 flex items-center gap-4 text-gray-300">
         <div className="h-[1px] w-12 bg-gray-200"></div>
         <p className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Grade Security</p>
         <div className="h-[1px] w-12 bg-gray-200"></div>
      </div>
    </div>
  );
}
