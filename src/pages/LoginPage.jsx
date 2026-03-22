import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../lib/firebase";
import { getOrCreateWelcomeCoupon, notifyCouponChanged } from "../utils/coupon";
import { Mail, Lock, Chrome, Facebook } from "lucide-react";

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

// ลอง endpoint ทั้งหมดพร้อมกัน แล้วใช้อันที่ตอบก่อน (timeout 8 วินาที)
async function tryLoginEndpoints(apiBaseUrl, emailNorm, password) {
  const candidates = [
    { path: "/login", body: { email: emailNorm, password } },
    { path: "/api/login", body: { email: emailNorm, password } },
    { path: "/login", body: { username: emailNorm, password } },
  ];

  // กรอง duplicates ออก
  const seen = new Set();
  const unique = candidates.filter((c) => {
    const key = `${c.path}:${JSON.stringify(c.body)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const results = await Promise.allSettled(
      unique.map((c) =>
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
    return { data: null, error: firstErr?.reason?.message || "AUTHENTICATION FAILED. PLEASE VERIFY." };
  } finally {
    clearTimeout(timeoutId);
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const apiBaseUrl = resolveApiBaseUrl();

  async function afterLoginGo(userlike) {
    localStorage.setItem("auramatch:isLoggedIn", "true");
    localStorage.setItem("auramatch:user", JSON.stringify(userlike));

    const adminFlag = userlike.role === "admin";
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
      if (!apiBaseUrl && !["localhost", "127.0.0.1"].includes(window.location.hostname)) {
        setErr("SERVER CONFIGURATION MISSING. CONTACT SUPPORT.");
        return;
      }

      const { data, error } = await tryLoginEndpoints(apiBaseUrl, emailNorm, password);

      if (!data) {
        setErr((error || "AUTHENTICATION FAILED. PLEASE VERIFY.").toUpperCase());
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
      if (e?.name === "AbortError") {
        setErr("REQUEST TIMEOUT. PLEASE TRY AGAIN.");
        return;
      }
      setErr("NETWORK ERROR. CANNOT REACH AUTH SERVER.");
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
    <div className="relative min-h-screen overflow-hidden bg-[#F6F3F1] text-[#1A1A1A]">
      <div className="absolute inset-0 bg-[url('/assets/home2.webp')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-white/55" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1100px] items-center justify-center px-6 py-20">
        <div className="w-full max-w-[460px] rounded-[22px] border border-[#E9E2E6] bg-white p-10 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
          <div className="mb-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D23669]">Auramatch</p>
            <h1 className="mt-3 text-3xl font-[900] tracking-tight">Login</h1>
            <p className="mt-2 text-[12px] text-gray-500">เข้าสู่ระบบเพื่อใช้งานบริการทั้งหมดของคุณ</p>
          </div>

          {err && (
            <div className="mb-6 rounded-[14px] border border-rose-100 bg-rose-50 px-4 py-3" role="alert">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">{err}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Email
              </label>
              <div className="relative mt-2">
                <input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#E5DDE2] bg-[#FAF8F9] px-4 py-3 text-sm font-semibold text-[#1A1A1A] placeholder:text-gray-400 focus:border-[#D23669] focus:outline-none focus:ring-2 focus:ring-[#D23669]/15"
                  autoComplete="email"
                  required
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C7B9C1]" size={18} />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#E5DDE2] bg-[#FAF8F9] px-4 py-3 text-sm font-semibold text-[#1A1A1A] placeholder:text-gray-400 focus:border-[#D23669] focus:outline-none focus:ring-2 focus:ring-[#D23669]/15"
                  autoComplete="current-password"
                  required
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C7B9C1]" size={18} />
              </div>
              <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-[#D8C8D1] text-[#D23669] focus:ring-[#D23669]/20" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="hover:text-[#D23669]">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#1A1A1A] py-3.5 text-[10px] font-black uppercase tracking-[0.35em] text-white transition-all hover:bg-[#D23669] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#EAE2E6]" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Or continue</span>
            <div className="h-px flex-1 bg-[#EAE2E6]" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SocialBtn
              onClick={() => onSocialLogin(googleProvider, "Google")}
              label="Google"
              icon={<Chrome size={16} />}
              disabled={loading}
            />
            <SocialBtn
              onClick={() => onSocialLogin(facebookProvider, "Facebook")}
              label="Facebook"
              icon={<Facebook size={16} />}
              disabled={loading}
            />
          </div>

          <footer className="mt-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              No account?
              <Link
                to="/register"
                className="ml-2 border-b-2 border-[#D23669] pb-0.5 text-[#D23669] transition-all hover:border-black hover:text-black"
              >
                Create one
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

function SocialBtn({ onClick, label, icon, disabled }) {
  return (
    <button
      onClick={onClick}
      type="button"
      disabled={disabled}
      className="flex items-center justify-center gap-3 rounded-full border border-[#E6D9E1] bg-white py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A] transition-all hover:border-[#D23669] hover:text-[#D23669] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="text-[#D23669]">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
