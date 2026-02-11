import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../lib/firebase";
import { getOrCreateWelcomeCoupon, notifyCouponChanged } from "../utils/coupon";
import { Mail, Lock, ArrowRight, Chrome, Facebook, Sparkles, Zap } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5010").replace(/\/+$/, "");
  const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "admin@example.com")
    .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

  const isAdminEmail = (e) => ADMIN_EMAILS.includes((e || "").toLowerCase());

  async function afterLoginGo(userlike) {
    localStorage.setItem("auramatch:isLoggedIn", "true");
    localStorage.setItem("auramatch:user", JSON.stringify(userlike));
    
    const adminFlag = userlike.role === "admin" || isAdminEmail(userlike.email);
    localStorage.setItem("auramatch:isAdmin", adminFlag ? "true" : "false");

    await getOrCreateWelcomeCoupon({ uid: userlike.uid });

    window.dispatchEvent(new Event("auth:changed"));
    notifyCouponChanged();

    if (adminFlag) {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const emailNorm = email.trim().toLowerCase();
      if (!emailNorm || !password) {
        setErr("IDENTITY DETAILS REQUIRED");
        return;
      }
      const res = await fetch(`${apiBaseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailNorm, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr((data.error || "AUTHENTICATION FAILED. PLEASE VERIFY.").toUpperCase());
        return;
      }
      const userPayload = data.user || data;
      const userlike = {
        uid: String(userPayload.user_id || ""),
        email: userPayload.email || emailNorm,
        name: userPayload.username || emailNorm.split("@")[0],
        photoURL: userPayload.avatar || "",
        role: userPayload.role || "user",
        provider: "password",
      };
      if (data.token) {
        localStorage.setItem("auramatch:token", data.token);
      }
      await afterLoginGo(userlike);
    } catch (e) {
      setErr("AUTHENTICATION FAILED. PLEASE VERIFY.");
    } finally {
      setLoading(false);
    }
  };

  const onSocialLogin = async (provider, name) => {
    setErr("");
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, provider);
      const u = res.user;
      await afterLoginGo({
        uid: u.uid,
        email: u.email,
        name: u.displayName,
        photoURL: u.photoURL || "",
        provider: name,
      });
    } catch (e) {
      setErr(`CONNECTION FAILED WITH ${name.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFD] text-black flex flex-col lg:flex-row overflow-hidden selection:bg-[#FF8E9E] selection:text-white">
      
      {/* 1. LEFT SIDE: THE MAG VISUAL */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative items-center justify-center p-12 overflow-hidden border-r-[12px] border-black">
        <div className="absolute inset-0 opacity-60">
           <img 
            src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1000" 
            alt="Glam Visual" 
            className="w-full h-full object-cover grayscale contrast-125"
           />
        </div>
        
        {/* Pink Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FF8E9E]/40 to-transparent" />

        <div className="relative z-10 text-center space-y-6">
           <div className="inline-flex items-center gap-3 bg-white text-black px-6 py-2 rounded-full mb-4">
              <Sparkles size={14} className="text-[#FF8E9E]" />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase italic">The New Standard</span>
           </div>
           <h2 className="text-[12vw] font-black italic text-white leading-[0.8] tracking-tighter uppercase drop-shadow-[10px_10px_0px_#FF8E9E]">
             GLAM <br/> CORE.
           </h2>
           <p className="text-white font-black text-[12px] tracking-[0.5em] uppercase italic bg-black/50 backdrop-blur-md py-4">
             Biometric Beauty & Elegance.
           </p>
        </div>

        {/* Brutalist Tag */}
        <div className="absolute bottom-10 left-10 border-4 border-white p-4 text-white font-black italic uppercase text-xs">
            Established 2026
        </div>
      </div>

      {/* 2. RIGHT SIDE: BRUTALIST LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 md:px-20 relative bg-white py-20 lg:py-0">
        
        <div className="w-full max-w-md relative z-10">
          
          <header className="mb-16 text-center">
            <h1 className="text-7xl font-black uppercase italic tracking-tighter mb-2 leading-none">
              LOGIN <span className="text-[#FF8E9E]">VIP.</span>
            </h1>
            <div className="h-2 w-24 bg-black mx-auto mb-6" />
            <p className="text-[10px] text-gray-400 tracking-[0.4em] uppercase font-black italic">Access Your Personal Studio</p>
          </header>

          {err && (
            <div className="mb-10 p-5 bg-black text-white border-l-[10px] border-[#FF8E9E] shadow-[10px_10px_0px_0px_#FF8E9E] animate-bounce-subtle">
              <p className="text-[10px] font-black uppercase tracking-widest">{err}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="group">
              <label className="text-[10px] font-black uppercase italic tracking-[0.2em] mb-2 block text-[#FF8E9E]">User Identity</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="EMAIL@AURA.COM"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FFF0F2] border-[4px] border-black rounded-2xl py-5 px-6 text-xs font-black tracking-[0.2em] focus:shadow-[6px_6px_0px_0px_#FF8E9E] transition-all outline-none placeholder:text-gray-300 uppercase italic"
                  required
                />
                <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-black" size={18} />
              </div>
            </div>

            <div className="group">
              <label className="text-[10px] font-black uppercase italic tracking-[0.2em] mb-2 block text-[#FF8E9E]">Security Key</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FFF0F2] border-[4px] border-black rounded-2xl py-5 px-6 text-xs font-black tracking-[0.2em] focus:shadow-[6px_6px_0px_0px_#FF8E9E] transition-all outline-none placeholder:text-gray-300 uppercase"
                  required
                />
                <Lock className="absolute right-6 top-1/2 -translate-y-1/2 text-black" size={18} />
              </div>
              <div className="flex justify-end mt-4">
                <Link to="/forgot-password" className="text-[9px] font-black tracking-[0.2em] text-gray-400 uppercase italic hover:text-[#FF8E9E]">Recovery?</Link>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-6 bg-black text-white rounded-[20px] shadow-[10px_10px_0px_0px_#FF8E9E] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-4 relative overflow-hidden group"
            >
              <span className="text-[12px] tracking-[0.4em] font-black uppercase italic z-10">
                {loading ? "VERIFYING..." : "ENTER THE ATELIER"}
              </span>
              <Zap size={18} className="z-10 text-[#FF8E9E] fill-[#FF8E9E]" />
              <div className="absolute inset-0 bg-[#FF8E9E] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 opacity-20" />
            </button>
          </form>

          {/* Social Connect */}
          <div className="mt-16">
            <div className="relative flex items-center mb-8">
              <div className="flex-grow h-1 bg-black"></div>
              <span className="px-6 text-[9px] font-black text-black uppercase italic tracking-widest">Connect Via</span>
              <div className="flex-grow h-1 bg-black"></div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <SocialBtn 
                onClick={() => onSocialLogin(googleProvider, "Google")} 
                label="GOOGLE" 
                icon={<Chrome size={16} />} 
              />
              <SocialBtn 
                onClick={() => onSocialLogin(facebookProvider, "Facebook")} 
                label="FACEBOOK" 
                icon={<Facebook size={16} />} 
              />
            </div>
          </div>

          <footer className="mt-16 text-center">
             <p className="text-[10px] tracking-[0.2em] text-gray-400 uppercase font-black italic">
               No Account?{" "}
               <Link to="/register" className="text-[#FF8E9E] border-b-2 border-[#FF8E9E] pb-0.5 ml-2 hover:bg-[#FF8E9E] hover:text-white transition-all">
                 Join the Elite
               </Link>
             </p>
          </footer>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,900;1,900&display=swap');
        body { font-family: 'Montserrat', sans-serif; }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function SocialBtn({ onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-3 py-4 border-[4px] border-black rounded-2xl bg-white transition-all shadow-[5px_5px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 group"
    >
      <span className="group-hover:text-[#FF8E9E] transition-colors">{icon}</span>
      <span className="text-[10px] tracking-[0.2em] font-black uppercase italic">{label}</span>
    </button>
  );
}
