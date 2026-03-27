import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

function resolveApiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";
  if (raw) return String(raw).replace(/\/+$/, "");

  const isLocalhost =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (isLocalhost) return "http://127.0.0.1:5010";

  return "";
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const apiBaseUrl = resolveApiBaseUrl();

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    if (!token) {
      setErr("This link is invalid or has expired.");
      return;
    }
    if (pw.length < 8) {
      setErr("Password must be at least 8 characters long.");
      return;
    }
    if (pw !== pw2) {
      setErr("Passwords do not match.");
      return;
    }
    if (!apiBaseUrl) {
      setErr("SERVER CONFIGURATION MISSING. CONTACT SUPPORT.");
      return;
    }
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      let res;
      try {
        res = await fetch(`${apiBaseUrl}/password/reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password: pw }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr((data.error || "Sorry, please try again.").toString());
        return;
      }
      setMsg("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (e) {
      if (e?.name === "AbortError") {
        setErr("REQUEST TIMEOUT. PLEASE TRY AGAIN.");
      } else {
        setErr("NETWORK ERROR. CANNOT REACH AUTH SERVER.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-light flex items-center justify-center px-6 pt-20 selection:bg-[#C5A358]/20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <span className="text-[15vw] font-serif italic text-gray-100 select-none uppercase leading-none opacity-40">
          Reset
        </span>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/40 p-10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm">
        <div className="text-center mb-10 space-y-4">
          <span className="text-[10px] tracking-[0.6em] font-bold uppercase text-[#C5A358]">AuraMatch Atelier</span>
          <h1 className="text-4xl font-serif italic leading-none">Reset Password.</h1>
          <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase max-w-[250px] mx-auto leading-relaxed">
            Set a new password for your account
          </p>
        </div>

        {msg && <div className="mb-8 py-4 border-l-2 border-green-500 bg-white px-4 text-[11px] font-bold text-green-600 uppercase tracking-widest">{msg}</div>}
        {err && <div className="mb-8 py-4 border-l-2 border-[#C5A358] bg-white px-4 text-[11px] font-bold text-red-500 uppercase tracking-widest">{err}</div>}

        {!msg && (
          <form onSubmit={onSubmit} className="space-y-8">
            <input
              type="password"
              placeholder="NEW PASSWORD"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full bg-transparent border-b border-gray-200 py-4 text-xs tracking-[0.2em] focus:outline-none focus:border-[#C5A358] transition-all placeholder:text-gray-300 uppercase"
              required
            />
            <input
              type="password"
              placeholder="CONFIRM PASSWORD"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              className="w-full bg-transparent border-b border-gray-200 py-4 text-xs tracking-[0.2em] focus:outline-none focus:border-[#C5A358] transition-all placeholder:text-gray-300 uppercase"
              required
            />
            <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400">
              Password must be 8+ characters with letters and numbers
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 border border-[#1A1A1A] bg-[#1A1A1A] text-white text-[10px] tracking-[0.4em] font-bold uppercase transition-all hover:bg-transparent hover:text-[#1A1A1A]"
            >
              {loading ? "Saving..." : "Reset Password"}
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
