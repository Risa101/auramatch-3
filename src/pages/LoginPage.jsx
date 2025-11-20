// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../lib/firebase";
import { getOrCreateWelcomeCoupon, notifyCouponChanged } from "../utils/coupon";

export default function LoginPage() {
  const navigate = useNavigate();

  // ฟอร์มเดียว (ไม่มีแท็บ)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // กำหนดอีเมลแอดมินจาก .env
  const ADMIN_EMAILS =
    (import.meta.env.VITE_ADMIN_EMAILS || "admin@example.com")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

  const isAdminEmail = (e) => ADMIN_EMAILS.includes((e || "").toLowerCase());

  async function afterLoginGo(userlike) {
    // เก็บสถานะผู้ใช้
    localStorage.setItem("auramatch:isLoggedIn", "true");
    localStorage.setItem("auramatch:user", JSON.stringify(userlike));

    // สร้าง/ดึงคูปองต้อนรับ
    await getOrCreateWelcomeCoupon({ uid: userlike.uid });
    notifyCouponChanged();

    // ถ้าเป็นแอดมิน -> ไปแดชบอร์ด
    const adminFlag = isAdminEmail(userlike.email);
    localStorage.setItem("auramatch:isAdmin", adminFlag ? "true" : "false");
    if (adminFlag) {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/", { replace: true }); // เปลี่ยนเป็นหน้าที่ต้องการได้
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const emailNorm = email.trim().toLowerCase();
      if (!emailNorm || !password) {
        setErr("กรุณากรอกอีเมลและรหัสผ่าน");
        return;
      }

      // 🔧 ตัวอย่างระบบเดิม: จำลอง email/password (ยังไม่ใช้ Firebase email/pass)
      const userlike = {
        uid: "local-" + emailNorm,
        email: emailNorm,
        name: emailNorm.split("@")[0],
        photoURL: "",
        photo: "",
        provider: "password",
      };

      await afterLoginGo(userlike);
    } catch (e) {
      console.error(e);
      setErr("ไม่สามารถเข้าสู่ระบบได้");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const u = res.user;
      await afterLoginGo({
        uid: u.uid,
        email: u.email,
        name: u.displayName,
        photoURL: u.photoURL || "",
        photo: u.photoURL || "",
        provider: "google",
      });
    } catch (e) {
      console.error(e);
      setErr("เชื่อมต่อ Google OAuth ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const onFacebook = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, facebookProvider);
      const u = res.user;
      await afterLoginGo({
        uid: u.uid,
        email: u.email,
        name: u.displayName,
        photoURL: u.photoURL || "",
        photo: u.photoURL || "",
        provider: "facebook",
      });
    } catch (e) {
      console.error(e);
      setErr("เชื่อมต่อ Facebook OAuth ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="bg-blobs" aria-hidden />
      <div className="login-box big-box">
        <div className="login-logo">AuraMatch</div>

        {/* ❌ ไม่มีแท็บ Admin/User */}
        <h2 className="login-title">Sign in to your account</h2>

        {err && <div className="lp-error" role="alert">{err}</div>}

        <form onSubmit={handleLogin} noValidate>
          <div className="input-wrap">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              autoComplete="email"
              required
            />
          </div>
          <div className="input-wrap">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              autoComplete="current-password"
              required
            />
            <div className="forgot-wrap">
              <a href="/forgot-password" className="forgot-link">Forgot password?</a>
            </div>

          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="lp-spinner" aria-label="loading" /> : "Log In"}
          </button>
        </form>

        <div className="login-divider">or continue with</div>
        <div className="social-wrap">
          <button type="button" className="social-btn google-btn" onClick={onGoogle} disabled={loading}>
            <img src="/assets/google.png" alt="Google" /> Google
          </button>
          <button type="button" className="social-btn facebook-btn" onClick={onFacebook} disabled={loading}>
            <img src="/assets/facebook.png" alt="Facebook" /> Facebook
          </button>
        </div>

        <p className="register-text">
          Don't have an account? <a href="/register">Register here</a>
        </p>

      </div>
    </div>
  );
}
