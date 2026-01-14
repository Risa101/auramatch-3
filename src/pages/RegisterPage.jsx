import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { getOrCreateWelcomeCoupon, notifyCouponChanged } from "../utils/coupon";

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "admin@example.com")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const isAdminEmail = (e) => ADMIN_EMAILS.includes((e || "").toLowerCase());

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

  function validatePassword(p) {
    if (p.length < 6) return "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
    if (!/[A-Za-z]/.test(p) || !/[0-9]/.test(p)) return "รหัสผ่านควรมีทั้งตัวอักษรและตัวเลข";
    return "";
  }

  async function signUpFirebase(emailNorm, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, emailNorm, password);
    try {
      if (displayName) await updateProfile(cred.user, { displayName });
      sendEmailVerification(cred.user).catch(() => {});
    } catch {}
    return cred.user;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setInfo("");
    const nm = name.trim();
    const emailNorm = email.trim().toLowerCase();

    if (!nm) return setErr("กรุณากรอกชื่อ-นามสกุล");
    if (!emailNorm) return setErr("กรุณากรอกอีเมล");
    const pwErr = validatePassword(pw);
    if (pwErr) return setErr(pwErr);
    if (pw !== pw2) return setErr("ยืนยันรหัสผ่านไม่ตรงกัน");
    if (!agree) return setErr("กรุณายอมรับเงื่อนไขการใช้บริการ");

    setLoading(true);
    try {
      let user;
      try {
        user = await signUpFirebase(emailNorm, pw, nm);
      } catch (fbErr) {
        const localUser = {
          uid: "local-" + emailNorm,
          email: emailNorm,
          displayName: nm,
          photoURL: "",
          providerId: "password",
        };
        const dbRaw = JSON.parse(localStorage.getItem("auramatch:users") || "[]");
        if (dbRaw.some((u) => u.email === emailNorm)) throw new Error("อีเมลนี้ถูกใช้งานแล้วในระบบ");
        localStorage.setItem("auramatch:users", JSON.stringify([...dbRaw, localUser]));
        user = localUser;
      }

      const userlike = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || nm,
        photoURL: user.photoURL || "",
        provider: user.providerId || "password",
      };

      localStorage.setItem("auramatch:isLoggedIn", "true");
      localStorage.setItem("auramatch:user", JSON.stringify(userlike));
      const adminFlag = isAdminEmail(userlike.email);
      localStorage.setItem("auramatch:isAdmin", adminFlag ? "true" : "false");

      await getOrCreateWelcomeCoupon({ uid: userlike.uid });
      notifyCouponChanged();
      window.dispatchEvent(new Event("auth:changed"));

      navigate(adminFlag ? "/admin/dashboard" : "/", { replace: true });
    } catch (e) {
      setErr(e.message || "ขออภัย สมัครสมาชิกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-light flex items-center justify-center px-6 pt-28 pb-12 selection:bg-[#C5A358]/20">
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <span className="text-[18vw] font-serif italic text-gray-100 select-none uppercase leading-none opacity-40">
          Studio
        </span>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10 space-y-4">
          <span className="text-[10px] tracking-[0.6em] font-bold uppercase text-[#C5A358]">AuraMatch Atelier</span>
          <h1 className="text-4xl md:text-5xl font-serif italic leading-none">Create Account.</h1>
          <p className="text-xs text-gray-400 tracking-widest uppercase">Join our curated beauty community</p>
        </div>

        {/* Feedback Message */}
        {(err || info) && (
          <div className={`mb-6 py-4 px-6 border-l-2 text-[11px] font-bold uppercase tracking-widest animate-fade-in ${
            err ? "border-[#C5A358] bg-white text-red-500" : "border-green-500 bg-white text-green-600"
          }`}>
            {err || info}
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white/40 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/20 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-100 py-3 text-sm focus:outline-none focus:border-[#C5A358] transition-all"
                  placeholder="EX. JANE DOE"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-100 py-3 text-sm focus:outline-none focus:border-[#C5A358] transition-all"
                  placeholder="EMAIL@EXAMPLE.COM"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase">Password</label>
                <input
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-100 py-3 text-sm focus:outline-none focus:border-[#C5A358] transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase">Confirm Password</label>
                <input
                  type="password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-100 py-3 text-sm focus:outline-none focus:border-[#C5A358] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4 flex items-start gap-3">
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 accent-[#C5A358]"
              />
              <label htmlFor="agree" className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                I agree to the <Link to="/terms" className="text-[#C5A358] underline">Terms</Link> and <Link to="/privacy" className="text-[#C5A358] underline">Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-5 border border-[#1A1A1A] bg-[#1A1A1A] text-white transition-all hover:bg-transparent hover:text-[#1A1A1A] overflow-hidden rounded-sm"
            >
              <span className="relative z-10 text-[10px] tracking-[0.4em] font-bold uppercase">
                {loading ? "Creating..." : "Create Account"}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] tracking-widest text-gray-400 uppercase">
              Already a member?{" "}
              <Link to="/login" className="text-[#C5A358] font-bold hover:border-b border-[#C5A358] pb-0.5 ml-1 transition-all">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-10 w-full text-center hidden md:block">
        <p className="text-[9px] tracking-[0.6em] font-bold uppercase text-gray-200 pointer-events-none">
          Paris — Bangkok — Tokyo
        </p>
      </footer>
    </div>
  );
}