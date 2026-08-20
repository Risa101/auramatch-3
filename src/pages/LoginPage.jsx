import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../lib/firebase";

function resolveApiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";
  if (raw) return String(raw).replace(/\/+$/, "");
  if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname))
    return "http://127.0.0.1:5010";
  return "";
}

async function tryLoginEndpoints(apiBaseUrl, emailNorm, password) {
  const candidates = [
    { path: "/login",     body: { email: emailNorm, password } },
    { path: "/api/login", body: { email: emailNorm, password } },
  ];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const results = await Promise.allSettled(
      candidates.map((c) =>
        fetch(`${apiBaseUrl}${c.path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(c.body),
          signal: controller.signal,
        }).then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || data.message || "AUTH_FAILED");
          return data;
        })
      )
    );
    for (const r of results) {
      if (r.status === "fulfilled") return { data: r.value, error: null };
    }
    const firstErr = results.find((r) => r.status === "rejected");
    return { data: null, error: firstErr?.reason?.message || "Authentication failed" };
  } finally {
    clearTimeout(timeoutId);
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState("");

  const apiBaseUrl = resolveApiBaseUrl();

  function afterLogin(userlike) {
    localStorage.setItem("auramatch:isLoggedIn", "true");
    localStorage.setItem("auramatch:user", JSON.stringify(userlike));
    localStorage.setItem("auramatch:isAdmin", userlike.role === "admin" ? "true" : "false");
    window.dispatchEvent(new Event("auth:changed"));
    navigate(userlike.role === "admin" ? "/admin/dashboard" : "/", { replace: true });
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const emailNorm = email.trim().toLowerCase();
      if (!emailNorm || !password) { setErr("Please fill in all fields"); return; }

      const { data, error } = await tryLoginEndpoints(apiBaseUrl, emailNorm, password);
      if (!data) { setErr(error || "Authentication failed"); return; }

      const u = data.user || data;
      if (data.token) localStorage.setItem("auramatch:token", data.token);
      afterLogin({
        uid: String(u.user_id || ""),
        email: u.email || emailNorm,
        name: u.username || emailNorm.split("@")[0],
        photoURL: u.avatar || "",
        role: u.role || "user",
        provider: "password",
      });
    } catch (e) {
      setErr(e?.name === "AbortError" ? "Request timeout. Please try again." : "Network error. Cannot reach server.");
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
      const token = await u.getIdToken();

      // Sync with backend
      let backendUser = {};
      let backendToken = token;
      try {
        const syncRes = await fetch(`${apiBaseUrl}/api/firebase-sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: u.email, name: u.displayName, photo_url: u.photoURL || "" }),
        });
        const syncData = await syncRes.json();
        backendUser = syncData.user || {};
        if (syncData.token) backendToken = syncData.token;
      } catch {
        // backend sync failed — use Firebase user data directly
      }

      localStorage.setItem("auramatch:token", backendToken);
      afterLogin({
        uid: String(backendUser.user_id || u.uid || ""),
        email: backendUser.email || u.email,
        name: backendUser.username || u.displayName,
        photoURL: backendUser.avatar || u.photoURL || "",
        role: backendUser.role || "user",
        provider: name,
      });
    } catch (e) {
      const code = e?.code || "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
      if (code === "auth/account-exists-with-different-credential")
        setErr("This email is already linked to another sign-in method.");
      else
        setErr(`${name} sign-in failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-[#FFF7F9] via-white to-[#FDEEF2] mt-[60px] lg:mt-[180px]">

      {/* ── Left: brand panel ── */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#D23669] via-[#C2255A] to-[#4A1A2A] p-14">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-[#FBD4DE]/20 blur-3xl" />
        <img src="/laglace/homee.webp" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay" />
        <div className="relative z-10">
          <p className="text-[9px] tracking-[0.5em] uppercase text-white/60 font-[300]">AuraMatch · Atelier</p>
        </div>
        <div className="relative z-10">
          <h2 className="font-['Cormorant_Garamond',serif] text-[3.6rem] font-[500] italic leading-[1.05] text-white mb-5">
            Discover<br />Your Aura
          </h2>
          <p className="text-xs font-[300] text-white/70 leading-relaxed max-w-[280px]">
            AI-powered personal color analysis and beauty styling tailored to you.
          </p>
        </div>
        <div className="relative z-10">
          <p className="text-[8px] tracking-[0.4em] uppercase text-white/40 font-[300]">
            © {new Date().getFullYear()} AuraMatch
          </p>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex flex-col justify-center px-6 md:px-16 py-16">

        {/* Mobile logo */}
        <p className="lg:hidden text-[9px] tracking-[0.5em] uppercase text-[#B08B95] font-[300] mb-8 text-center">AuraMatch · Atelier</p>

        <div className="max-w-[400px] w-full mx-auto bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(210,54,105,0.18)] border border-[#F7E4EA] p-8 md:p-11">

          {/* Heading */}
          <div className="mb-9">
            <p className="text-[9px] tracking-[0.45em] uppercase text-[#C58A9A] font-[500] mb-3">Welcome back</p>
            <h1 className="font-['Cormorant_Garamond',serif] text-[2.8rem] font-[600] italic leading-[1] text-[#2B2226]">
              Sign in
            </h1>
          </div>

          {/* Error */}
          {err && (
            <div className="mb-6 rounded-xl border border-[#D23669]/25 bg-[#FFF1F5] px-4 py-3">
              <p className="text-[11px] font-[500] text-[#D23669]">{err}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[9px] tracking-[0.35em] uppercase text-[#8A7A80] font-[500] block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-[#F0DEE3] bg-[#FFFBFC] px-4 py-3.5 text-sm font-[400] text-[#2B2226] placeholder:text-[#C7B7BC] focus:border-[#D23669] focus:ring-4 focus:ring-[#D23669]/10 focus:outline-none transition-all"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[9px] tracking-[0.35em] uppercase text-[#8A7A80] font-[500]">Password</label>
                <Link to="/forgot-password" className="text-[9px] tracking-[0.15em] uppercase text-[#B08B95] hover:text-[#D23669] transition-colors">
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-[#F0DEE3] bg-[#FFFBFC] px-4 py-3.5 text-sm font-[400] text-[#2B2226] placeholder:text-[#C7B7BC] focus:border-[#D23669] focus:ring-4 focus:ring-[#D23669]/10 focus:outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#D23669] to-[#C2255A] text-white py-3.5 text-[10px] font-[600] uppercase tracking-[0.35em] shadow-[0_8px_24px_-6px_rgba(210,54,105,0.5)] hover:shadow-[0_10px_28px_-4px_rgba(210,54,105,0.6)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#F0DEE3]" />
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#B08B95] font-[300]">or</span>
            <div className="h-px flex-1 bg-[#F0DEE3]" />
          </div>

          {/* Social buttons */}
          <div className="flex flex-col gap-3">
            <SocialBtn
              onClick={() => onSocialLogin(googleProvider, "Google")}
              disabled={loading}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              }
              label="Continue with Google"
            />
            <SocialBtn
              onClick={() => onSocialLogin(facebookProvider, "Facebook")}
              disabled={loading}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                </svg>
              }
              label="Continue with Facebook"
            />
          </div>

          {/* Register link */}
          <p className="mt-8 text-[9px] tracking-[0.3em] uppercase text-[#8A7A80] font-[300] text-center">
            No account?{" "}
            <Link to="/register" className="text-[#D23669] font-[600] hover:text-[#C2255A] transition-colors border-b border-[#D23669]/30">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function SocialBtn({ onClick, label, icon, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 rounded-xl border border-[#F0DEE3] bg-white px-5 py-3 text-[10px] font-[500] text-[#2B2226] tracking-[0.1em] hover:border-[#D23669]/40 hover:bg-[#FFF7F9] transition-all duration-200 disabled:opacity-50"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
