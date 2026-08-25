import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


function resolveApiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";
  if (raw) {
    return String(raw).replace(/\/+$/, "");
  }

  const isLocalhostHost =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (isLocalhostHost) return "http://127.0.0.1:5010";

  return "";
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const navigate = useNavigate();
  const apiBaseUrl = resolveApiBaseUrl();

  function validatePassword(p) {
    if (p.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Za-z]/.test(p) || !/[0-9]/.test(p)) return "Password must contain both letters and numbers.";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setInfo("");
    const nm = name.trim();
    const emailNorm = email.trim().toLowerCase();

    if (!nm) return setErr("Please enter your full name.");
    if (!emailNorm) return setErr("Please enter your email address.");
    const pwErr = validatePassword(pw);
    if (pwErr) return setErr(pwErr);
    if (pw !== pw2) return setErr("Passwords do not match.");
    if (!agree) return setErr("Please accept the terms of service.");
    if (!apiBaseUrl) return setErr("SERVER CONFIGURATION MISSING. CONTACT SUPPORT.");

    setLoading(true);
    try {
      const payload = { username: nm, email: emailNorm, password: pw };
      const candidatePaths = ["/register", "/api/register"];
      let matchedResult = null;
      let lastErrorMessage = "";

      for (const path of candidatePaths) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        try {
          const res = await fetch(`${apiBaseUrl}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok) {
            matchedResult = data;
            break;
          }
          lastErrorMessage = (data.error || data.message || "").toString();
        } catch (error) {
          if (error?.name === "AbortError") {
            lastErrorMessage = "REQUEST TIMEOUT. PLEASE TRY AGAIN.";
            break;
          }
          lastErrorMessage = error?.message || "NETWORK ERROR";
        } finally {
          clearTimeout(timeoutId);
        }
      }

      if (!matchedResult) {
        setErr(lastErrorMessage || "Sorry, registration failed. Please try again.");
        return;
      }

      const data = matchedResult;
      const userPayload = data.user || data;
      const userlike = {
        uid: String(userPayload.user_id || ""),
        email: userPayload.email || emailNorm,
        name: userPayload.username || nm,
        photoURL: userPayload.avatar || "",
        role: userPayload.role || "user",
        provider: "password",
      };
      if (data.token) {
        localStorage.setItem("auramatch:token", data.token);
      }

      localStorage.setItem("auramatch:isLoggedIn", "true");
      localStorage.setItem("auramatch:user", JSON.stringify(userlike));
      const adminFlag = userlike.role === "admin";
      localStorage.setItem("auramatch:isAdmin", adminFlag ? "true" : "false");

      window.dispatchEvent(new Event("auth:changed"));

      navigate(adminFlag ? "/admin/dashboard" : "/", { replace: true });
    } catch (e) {
      setErr(e.message || "Sorry, registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#FFF9FA] text-[#2B2226] font-light flex items-center justify-center px-6 pt-[60px] lg:pt-[180px] pb-12 selection:bg-[#D23669]/15 overflow-hidden">

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10 space-y-4">
          <span className="text-[10px] tracking-[0.6em] font-bold uppercase text-[#D23669]">AuraMatch Atelier</span>
          <h1 className="font-['Cormorant_Garamond',serif] text-4xl md:text-5xl italic leading-none text-[#2B2226]">Create Account.</h1>
          <p className="text-xs text-[#A78E96] tracking-widest uppercase">Join our curated beauty community</p>
        </div>

        {/* Feedback Message */}
        {(err || info) && (
          <div className={`mb-6 py-4 px-6 rounded-xl border text-[11px] font-bold uppercase tracking-widest animate-fade-in ${
            err ? "border-[#D23669]/30 bg-[#FFF1F5] text-[#D23669]" : "border-green-300 bg-green-50 text-green-600"
          }`}>
            {err || info}
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-[#F7E4EA] shadow-sm">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold tracking-[0.2em] text-[#8A7A80] uppercase">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#F0DEE3] bg-[#FFFBFC] px-4 py-3 text-sm focus:outline-none focus:border-[#D23669] focus:ring-4 focus:ring-[#D23669]/10 transition-all"
                  placeholder="Ex. Jane Doe"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold tracking-[0.2em] text-[#8A7A80] uppercase">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#F0DEE3] bg-[#FFFBFC] px-4 py-3 text-sm focus:outline-none focus:border-[#D23669] focus:ring-4 focus:ring-[#D23669]/10 transition-all"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold tracking-[0.2em] text-[#8A7A80] uppercase">Password</label>
                <input
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="w-full rounded-xl border border-[#F0DEE3] bg-[#FFFBFC] px-4 py-3 text-sm focus:outline-none focus:border-[#D23669] focus:ring-4 focus:ring-[#D23669]/10 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold tracking-[0.2em] text-[#8A7A80] uppercase">Confirm Password</label>
                <input
                  type="password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  className="w-full rounded-xl border border-[#F0DEE3] bg-[#FFFBFC] px-4 py-3 text-sm focus:outline-none focus:border-[#D23669] focus:ring-4 focus:ring-[#D23669]/10 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2 flex items-start gap-3">
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 accent-[#D23669]"
              />
              <label htmlFor="agree" className="text-[10px] text-[#8A7A80] uppercase tracking-widest leading-relaxed">
                I agree to the <Link to="/terms" className="text-[#D23669] underline">Terms</Link> and <Link to="/privacy" className="text-[#D23669] underline">Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-4 rounded-xl bg-[#D23669] hover:bg-[#B92D5B] text-white transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:bg-[#D23669] disabled:hover:shadow-sm disabled:hover:translate-y-0 overflow-hidden"
            >
              <span className="relative z-10 text-[10px] tracking-[0.4em] font-bold uppercase">
                {loading ? "Creating..." : "Create Account"}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] tracking-widest text-[#8A7A80] uppercase">
              Already a member?{" "}
              <Link to="/login" className="text-[#D23669] font-bold hover:border-b border-[#D23669] pb-0.5 ml-1 transition-all">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-10 w-full text-center hidden md:block">
        <p className="text-[9px] tracking-[0.6em] font-bold uppercase text-[#E8C3CD] pointer-events-none">
          Paris — Bangkok — Tokyo
        </p>
      </footer>
    </div>
  );
}
