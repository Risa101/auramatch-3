import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../lib/firebase";
import { getOrCreateWelcomeCoupon, notifyCouponChanged } from "../utils/coupon";

const BRAND = {
  primary: "#1A1A1A",
  accent: "#C5A358",
  bg: "#FDFCFB",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // กำหนดอีเมลแอดมิน
  const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "admin@example.com")
    .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

  const isAdminEmail = (e) => ADMIN_EMAILS.includes((e || "").toLowerCase());

  /** --- หัวใจหลัก: ฟังก์ชันหลัง Login สำเร็จ --- */
  async function afterLoginGo(userlike) {
    // 1. บันทึกข้อมูลสถานะลง LocalStorage
    localStorage.setItem("auramatch:isLoggedIn", "true");
    localStorage.setItem("auramatch:user", JSON.stringify(userlike));
    
    // 2. ตรวจสอบและบันทึกสิทธิ์ Admin
    const adminFlag = isAdminEmail(userlike.email);
    localStorage.setItem("auramatch:isAdmin", adminFlag ? "true" : "false");

    // 3. จัดการเรื่องคูปองต้อนรับ
    await getOrCreateWelcomeCoupon({ uid: userlike.uid });

    // 4. 🔥 ส่งสัญญาณ (Global Events) ไปอัปเดต Component อื่นๆ
    window.dispatchEvent(new Event("auth:changed")); // บอก Navbar ให้เปลี่ยนเป็นรูปโปรไฟล์
    notifyCouponChanged(); // บอก DiscountBanner ให้แสดงคูปอง

    // 5. นำทางผู้ใช้
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
        setErr("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }
      // จำลองข้อมูลผู้ใช้ (หรือใช้ Firebase Auth จริง)
      const userlike = {
        uid: "local-" + emailNorm,
        email: emailNorm,
        name: emailNorm.split("@")[0],
        photoURL: "", // สามารถเพิ่ม URL รูปภาพพื้นฐานได้ที่นี่
        provider: "password",
      };
      await afterLoginGo(userlike);
    } catch (e) {
      setErr("ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบข้อมูล");
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
      setErr(`เชื่อมต่อ ${name} ไม่สำเร็จ`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-light flex items-center justify-center px-6 selection:bg-[#C5A358]/20">
      
      {/* Background Decor: Maison Text */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <span className="text-[20vw] font-serif italic text-gray-100 select-none uppercase leading-none opacity-40">
          Aura
        </span>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-[10px] tracking-[0.6em] font-bold uppercase text-[#C5A358]">AuraMatch Studio</span>
          <h1 className="text-5xl font-serif italic leading-none">Welcome Back.</h1>
          <p className="text-xs text-gray-400 tracking-widest uppercase">Sign in to your atelier</p>
        </div>

        {/* Error Feedback */}
        {err && (
          <div className="mb-6 py-3 border-l-2 border-[#C5A358] bg-white px-4 text-[11px] font-bold text-red-500 uppercase tracking-widest animate-in fade-in slide-in-from-left-2">
            {err}
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="group">
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-gray-200 py-4 text-xs tracking-[0.2em] focus:outline-none focus:border-[#C5A358] transition-all placeholder:text-gray-300"
              required
            />
          </div>

          <div className="group">
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-gray-200 py-4 text-xs tracking-[0.2em] focus:outline-none focus:border-[#C5A358] transition-all placeholder:text-gray-300"
              required
            />
            <div className="flex justify-end pt-2">
              <a href="/forgot-password" className="text-[9px] tracking-widest uppercase text-gray-400 hover:text-[#C5A358] transition-colors">
                Forgot Password?
              </a>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="group relative w-full py-5 border border-[#1A1A1A] bg-[#1A1A1A] text-white transition-all hover:bg-transparent hover:text-[#1A1A1A] overflow-hidden rounded-sm"
          >
            <span className="relative z-10 text-[10px] tracking-[0.4em] font-bold uppercase">
              {loading ? "Authenticating..." : "Log In"}
            </span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative py-12 flex items-center">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="px-4 text-[9px] tracking-[0.3em] font-bold text-gray-300 uppercase">OR ACCESS WITH</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <SocialButton 
            onClick={() => onSocialLogin(googleProvider, "Google")} 
            label="Google" 
            icon="/assets/google.png" 
          />
          <SocialButton 
            onClick={() => onSocialLogin(facebookProvider, "Facebook")} 
            label="Facebook" 
            icon="/assets/facebook.png" 
          />
        </div>

        {/* Footer Link */}
        <div className="text-center">
          <p className="text-[10px] tracking-widest text-gray-400 uppercase">
            Not a member?{" "}
            <a href="/register" className="text-[#C5A358] font-bold hover:border-b border-[#C5A358] pb-0.5 ml-1 transition-all">
              Join the Studio
            </a>
          </p>
        </div>
      </div>

      {/* Global Branding Footer */}
      <footer className="fixed bottom-10 w-full text-center">
        <p className="text-[9px] tracking-[0.6em] font-bold uppercase text-gray-200 pointer-events-none">
          Paris — Bangkok — Tokyo
        </p>
      </footer>
    </div>
  );
}

function SocialButton({ onClick, label, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-3 py-4 border border-gray-100 hover:border-[#C5A358] transition-all group rounded-sm"
    >
      <img src={icon} alt={label} className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
      <span className="text-[9px] tracking-[0.2em] font-bold uppercase text-gray-600 group-hover:text-[#1A1A1A]">{label}</span>
    </button>
  );
}