import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";
import "./LoginPage.css"; // ใช้สไตล์เดียวกับหน้า login

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
      setMsg("เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว");
    } catch (e) {
      console.error(e);
      setErr("ไม่สามารถส่งอีเมลได้ ตรวจสอบอีเมลอีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="bg-blobs" aria-hidden />
      <div className="login-box big-box">
        <div className="login-logo">AuraMatch</div>
        <h2 className="login-title">Reset your password</h2>

        {msg && <div className="lp-success" role="status">{msg}</div>}
        {err && <div className="lp-error" role="alert">{err}</div>}

        <form onSubmit={onSubmit} noValidate>
          <div className="input-wrap">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="lp-spinner" /> : "Send reset link"}
          </button>
        </form>

        <p className="register-text">
          Remembered it? <a href="/login">Back to login</a>
        </p>
      </div>
    </div>
  );
}
