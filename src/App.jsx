// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

// Layout pieces
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DiscountBanner from "./components/DiscountBanner";
import "./lib/i18n"; // ✅ โหลดระบบแปลก่อน render ทุกหน้า


// ── Lazy pages (user side) ────────────────────────────────────────────────────
const AuraMatchPage   = lazy(() => import("./pages/AuramatchPage.jsx"));
const MakeupLooks     = lazy(() => import("./pages/MakeupLooks.jsx"));
const Analysis        = lazy(() => import("./pages/Analysis.jsx"));
const AdvisorPage     = lazy(() => import("./pages/AdvisorPage.jsx"));
const CosmeticsPage   = lazy(() => import("./pages/cosmeticPage.jsx"));
const AboutUs         = lazy(() => import("./pages/AboutUs.jsx"));
const NotFound        = lazy(() => import("./pages/NotFound.jsx"));
const LoginPage       = lazy(() => import("./pages/LoginPage.jsx"));
const AccountProfile  = lazy(() => import("./pages/AccountProfile.jsx"));
const Coupons         = lazy(() => import("./pages/Coupons.jsx"));
const AnalysisHistory = lazy(() => import("./pages/AnalysisHistory.jsx"));
const RegisterPage   = lazy(() => import("./pages/RegisterPage.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));

// ── Lazy pages (admin side) ───────────────────────────────────────────────────
const AdminDashboard  = lazy(() => import("./pages/admin/AdminDashboard.jsx"));

// ── Helpers: auth state from localStorage ─────────────────────────────────────
const isLoggedIn = () => localStorage.getItem("auramatch:isLoggedIn") === "true";
const isAdmin    = () => localStorage.getItem("auramatch:isAdmin") === "true";

// ── Route guards ──────────────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { pathname } = useLocation();
  return isLoggedIn() ? children : <Navigate to="/login" state={{ from: pathname }} replace />;
}

function RequireAdmin({ children }) {
  const { pathname } = useLocation();
  if (!isLoggedIn()) return <Navigate to="/login" state={{ from: pathname }} replace />;
  return isAdmin() ? children : <Navigate to="/" replace />;
}

// ── Chrome wrapper: hide site chrome for /admin/* ─────────────────────────────
function ChromeWrapper({ children }) {
  const { pathname } = useLocation();
  const hideChrome = pathname.startsWith("/admin");

  return (
    <>
      {!hideChrome && <Navbar />}
      {!hideChrome && <DiscountBanner />}
      <Suspense fallback={<div className="p-8 text-[#75464A]">Loading…</div>}>
        {children}
      </Suspense>
      {!hideChrome && <Footer />}
    </>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Router>
      <ChromeWrapper>
        <Routes>
          {/* Public routes */}
          <Route path="/"          element={<AuraMatchPage />} />
          <Route path="/looks"     element={<MakeupLooks />} />
          <Route path="/analysis"  element={<Analysis />} />
          <Route path="/advisor"   element={<AdvisorPage />} />
          <Route path="/cosmetics" element={<CosmeticsPage />} />
          <Route path="/about"     element={<AboutUs />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/coupons"   element={<Coupons />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected (user) */}
          <Route
            path="/history"
            element={
              <RequireAuth>
                <AnalysisHistory />
              </RequireAuth>
            }
          />
          <Route
            path="/account"
            element={
              <RequireAuth>
                <AccountProfile />
              </RequireAuth>
            }
          />

          {/* Admin routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/admin/dashboard"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ChromeWrapper>
    </Router>
  );
}
