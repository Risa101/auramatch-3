// src/pages/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

import { auth } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { getOrCreateWelcomeCoupon, notifyCouponChanged } from "../utils/coupon";

/** helper: รายชื่ออีเมลแอดมินจาก .env (คั่นด้วย ,) */
const ADMIN_EMAILS =
  (import.meta.env.VITE_ADMIN_EMAILS || "admin@example.com")
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

  /** ตรวจความแข็งแรงรหัสผ่านแบบเบาๆ */
  function validatePassword(p) {
    if (p.length < 6) return "รหัสผ่านอย่างน้อย 6 ตัวอักษร";
    if (!/[A-Za-z]/.test(p) || !/[0-9]/.test(p))
      return "ควรมีทั้งตัวอักษรและตัวเลข";
    return "";
  }

  async function signUpFirebase(emailNorm, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, emailNorm, password);
    try {
      if (displayName) await updateProfile(cred.user, { displayName });
      // ส่งอีเมลยืนยัน (ไม่บล็อก flow)
      sendEmailVerification(cred.user).catch(() => {});
    } catch {}
    return cred.user;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setInfo("");

    const nm = name.trim();
    const emailNorm = email.trim().toLowerCase();

    if (!nm) return setErr("กรุณากรอกชื่อ");
    if (!emailNorm) return setErr("กรุณากรอกอีเมล");

    const pwErr = validatePassword(pw);
    if (pwErr) return setErr(pwErr);
    if (pw !== pw2) return setErr("รหัสผ่านไม่ตรงกัน");
    if (!agree) return setErr("กรุณายอมรับข้อกำหนดการใช้งาน");

    setLoading(true);
    try {
      let user;

      // 1) พยายามสมัครด้วย Firebase
      try {
        user = await signUpFirebase(emailNorm, pw, nm);
      } catch (fbErr) {
        // 2) Fallback localStorage (เดโม่/ออฟไลน์)
        const localUser = {
          uid: "local-" + emailNorm,
          email: emailNorm,
          displayName: nm,
          photoURL: "",
          providerId: "password",
        };
        const dbRaw = JSON.parse(localStorage.getItem("auramatch:users") || "[]");
        if (dbRaw.some((u) => u.email === emailNorm)) {
          throw new Error("อีเมลนี้ถูกใช้งานแล้ว");
        }
        localStorage.setItem(
          "auramatch:users",
          JSON.stringify([...dbRaw, localUser])
        );
        user = localUser;
      }

      // ---- Login ทันทีหลังสมัคร ----
      const userlike = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || nm,
        photoURL: user.photoURL || "",
        photo: user.photoURL || "",
        provider: user.providerId || "password",
      };

      localStorage.setItem("auramatch:isLoggedIn", "true");
      localStorage.setItem("auramatch:user", JSON.stringify(userlike));

      // ธง Admin + เส้นทาง
      const adminFlag = isAdminEmail(userlike.email);
      localStorage.setItem("auramatch:isAdmin", adminFlag ? "true" : "false");

      // คูปองต้อนรับ
      await getOrCreateWelcomeCoupon({ uid: userlike.uid });
      notifyCouponChanged();

      // แจ้งทุกแท็บให้รีเฟรชสถานะ
      window.dispatchEvent(new Event("auth:changed"));

      // ถ้าใช้ Firebase: แจ้งผู้ใช้เรื่องอีเมลยืนยัน (ไม่บังคับ)
      setInfo("สมัครสำเร็จ! หากใช้อีเมลจริง โปรดตรวจสอบอีเมลยืนยันจากระบบ");

      // นำทาง
      navigate(adminFlag ? "/admin/dashboard" : "/", { replace: true });
    } catch (e) {
      console.error(e);
      const msg =
        typeof e?.message === "string" && e.message
          ? e.message
          : "สมัครสมาชิกไม่สำเร็จ";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="bg-blobs" aria-hidden />
      <div className="login-box big-box">
        <div className="login-logo">AuraMatch</div>

        <h2 className="login-title">Create your account</h2>

        {info && <div className="lp-success" role="status">{info}</div>}
        {err && <div className="lp-error" role="alert">{err}</div>}

        <form onSubmit={onSubmit} noValidate>
          <div className="input-wrap">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="login-input"
              autoComplete="name"
              required
            />
          </div>

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
              placeholder="Password (min 6, letters+numbers)"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="login-input"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="input-wrap">
            <input
              type="password"
              placeholder="Confirm password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              className="login-input"
              autoComplete="new-password"
              required
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[#75464A] mb-3">
            <input
              type="checkbox"
              className="accent-[#75464A]"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            I accept the <a href="/terms" className="underline ml-1">Terms</a> &{" "}
            <a href="/privacy" className="underline">Privacy Policy</a>
          </label>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="lp-spinner" aria-label="loading" /> : "Create account"}
          </button>
        </form>

        <p className="register-text">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
