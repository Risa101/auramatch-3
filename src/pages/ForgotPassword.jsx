// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMsg("เราได้ส่งลิงก์รีเซ็ตไปที่อีเมลของคุณเรียบร้อยแล้ว");
    } catch (e) {
      setErr("ไม่พบข้อมูลอีเมลนี้ในระบบสมาชิกของเรา");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-light flex items-center justify-center px-6 pt-20 selection:bg-[#C5A358]/20">
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <span className="text-[15vw] font-serif italic text-gray-100 select-none uppercase leading-none opacity-40">
          Atelier
        </span>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/40 p-10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm">
        <div className="text-center mb-10 space-y-4">
          <span className="text-[10px] tracking-[0.6em] font-bold uppercase text-[#C5A358]">AuraMatch Atelier</span>
          <h1 className="text-4xl font-serif italic leading-none">Recover Access.</h1>
          <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase max-w-[250px] mx-auto leading-relaxed">
            Enter your email to receive a password restoration link
          </p>
        </div>

        {msg && <div className="mb-8 py-4 border-l-2 border-green-500 bg-white px-4 text-[11px] font-bold text-green-600 uppercase tracking-widest">{msg}</div>}
        {err && <div className="mb-8 py-4 border-l-2 border-[#C5A358] bg-white px-4 text-[11px] font-bold text-red-500 uppercase tracking-widest">{err}</div>}

        {!msg && (
          <form onSubmit={onSubmit} className="space-y-8">
            <input
              type="email"
              placeholder="REGISTERED EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-gray-200 py-4 text-xs tracking-[0.2em] focus:outline-none focus:border-[#C5A358] transition-all placeholder:text-gray-300 uppercase"
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 border border-[#1A1A1A] bg-[#1A1A1A] text-white text-[10px] tracking-[0.4em] font-bold uppercase transition-all hover:bg-transparent hover:text-[#1A1A1A]"
            >
              {loading ? "Sending..." : "Send Restoration Link"}
            </button>
          </form>
        )}

        <div className="mt-12 text-center">
          <Link to="/login" className="text-[10px] tracking-widest text-gray-400 uppercase hover:text-[#C5A358] transition-colors inline-flex items-center gap-3 group">
            <span className="w-8 h-[1px] bg-gray-200 group-hover:bg-[#C5A358] transition-all"></span>
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}