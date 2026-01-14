// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

// Layout pieces
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DiscountBanner from "./components/DiscountBanner";
import "./lib/i18n"; 

// ── Lazy pages (User Side) ────────────────────────────────────────────────────
const AuraMatchPage   = lazy(() => import("./pages/AuramatchPage.jsx"));
const LoginPage       = lazy(() => import("./pages/LoginPage.jsx"));
const RegisterPage    = lazy(() => import("./pages/RegisterPage.jsx"));
const ForgotPassword  = lazy(() => import("./pages/ForgotPassword.jsx"));
const Analysis        = lazy(() => import("./pages/Analysis.jsx"));
const AboutUs         = lazy(() => import("./pages/AboutUs.jsx"));
const MakeupLooks     = lazy(() => import("./pages/MakeupLooks.jsx"));
const AdvisorPage     = lazy(() => import("./pages/AdvisorPage.jsx"));
const CosmeticsPage   = lazy(() => import("./pages/cosmeticPage.jsx"));
const AccountProfile  = lazy(() => import("./pages/AccountProfile.jsx")); // เพิ่มหน้านี้
const AnalysisHistory = lazy(() => import("./pages/AnalysisHistory.jsx")); // เพิ่มหน้านี้
const Coupons         = lazy(() => import("./pages/Coupons.jsx")); // เพิ่มหน้านี้

// ── Lazy pages (Admin Side) ───────────────────────────────────────────────────
const AdminDashboard  = lazy(() => import("./pages/admin/AdminDashboard.jsx"));

// ── Helpers ───────────────────────────────────────────────────────────────────
const isLoggedIn = () => localStorage.getItem("auramatch:isLoggedIn") === "true";
const isAdmin    = () => localStorage.getItem("auramatch:isAdmin") === "true";

// ── Route guards (ตัวป้องกันหน้า) ──────────────────────────────────────────────
function RequireAuth({ children }) {
  const { pathname } = useLocation();
  // ถ้ายังไม่ล็อกอิน ให้ดีดไปหน้า login
  return isLoggedIn() ? children : <Navigate to="/login" state={{ from: pathname }} replace />;
}

function RequireAdmin({ children }) {
  const { pathname } = useLocation();
  if (!isLoggedIn()) return <Navigate to="/login" state={{ from: pathname }} replace />;
  // ถ้าไม่ใช่ admin ให้ดีดไปหน้าแรก
  return isAdmin() ? children : <Navigate to="/" replace />;
}

// ── Chrome Wrapper ────────────────────────────────────────────────────────────
function ChromeWrapper({ children }) {
  const { pathname } = useLocation();
  const hideChrome = pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCFB]">
      {!hideChrome && <Navbar />}
      
      <main className="flex-grow flex flex-col">
        {!hideChrome && <DiscountBanner />}
        
        <Suspense 
          fallback={
            <div className="flex-grow flex items-center justify-center bg-[#FDFCFB]">
              <div className="text-[10px] tracking-[0.5em] font-bold uppercase text-[#C5A358] animate-pulse">
                AuraMatch Atelier...
              </div>
            </div>
          }
        >
          {children}
        </Suspense>
      </main>

      {!hideChrome && <Footer />}
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Router basename="/AURAMATCH-VER2"> 
      <ChromeWrapper>
        <Routes>
          {/* Public Routes (เข้าได้ทุกคน) */}
          <Route path="/"                   element={<AuraMatchPage />} />
          <Route path="/login"              element={<LoginPage />} />
          <Route path="/register"           element={<RegisterPage />} />
          <Route path="/forgot-password"    element={<ForgotPassword />} />
          <Route path="/about"              element={<AboutUs />} />
          <Route path="/looks"              element={<MakeupLooks />} />
          <Route path="/advisor"            element={<AdvisorPage />} />
          <Route path="/cosmetics"          element={<CosmeticsPage />} />
          <Route path="/cosmetics/:category" element={<CosmeticsPage />} />

          {/* Protected Routes (ต้อง Login เท่านั้น) */}
          <Route 
            path="/account" 
            element={<RequireAuth><AccountProfile /></RequireAuth>} 
          />
          <Route 
            path="/history" 
            element={<RequireAuth><AnalysisHistory /></RequireAuth>} 
          />
          <Route 
            path="/coupons" 
            element={<RequireAuth><Coupons /></RequireAuth>} 
          />
          <Route 
            path="/analysis" 
            element={<RequireAuth><Analysis /></RequireAuth>} 
          />

          {/* Admin Routes (ต้องเป็น Admin เท่านั้น) */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/admin/dashboard"
            element={<RequireAdmin><AdminDashboard /></RequireAdmin>}
          />

          {/* 404 - ไม่พบหน้า */}
          <Route path="*" element={
            <div className="pt-40 text-center font-serif italic">
              <h2 className="text-4xl text-[#1A1A1A]">Page Not Found</h2>
              <p className="text-[#C5A358] mt-4 uppercase tracking-widest text-xs">Error 404</p>
            </div>
          } />
        </Routes>
      </ChromeWrapper>
    </Router>
  );
}