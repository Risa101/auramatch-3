// src/components/RequireVerified.jsx
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";

export default function RequireVerified({ children }) {
  const u = auth.currentUser;
  if (!u) return <Navigate to="/login" replace />;
  if (!u.emailVerified) return <div className="p-6">กรุณายืนยันอีเมลก่อนใช้งานหน้านี้</div>;
  return children;
}
