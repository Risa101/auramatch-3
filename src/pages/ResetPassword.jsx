// src/pages/ResetPassword.jsx
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

export default function ResetPassword() {
  const [email,setEmail] = useState(""); const [msg,setMsg]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const isEmail = (s)=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
  const onSubmit=async(e)=>{e.preventDefault(); setErr(""); setMsg(""); if(!isEmail(email)) return setErr("รูปแบบอีเมลไม่ถูกต้อง");
    setLoading(true);
    try{ await sendPasswordResetEmail(auth, email.trim().toLowerCase()); setMsg("ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว"); }
    catch(e){ console.error(e); setErr("ไม่สามารถส่งอีเมลรีเซ็ตได้"); }
    finally{ setLoading(false); }
  };
  return(
    <div className="login-container">
      <div className="login-box big-box">
        <h2 className="login-title">Reset your password</h2>
        {msg && <div className="lp-success" role="status">{msg}</div>}
        {err && <div className="lp-error" role="alert">{err}</div>}
        <form onSubmit={onSubmit}>
          <div className="input-wrap">
            <input type="email" className="login-input" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <button className="login-btn" disabled={loading || !isEmail(email)}>
            {loading ? <span className="lp-spinner" /> : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
}
