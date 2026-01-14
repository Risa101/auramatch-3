// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DiscountBanner from "./components/DiscountBanner";
import "./lib/i18n"; 

const AuraMatchPage   = lazy(() => import("./pages/AuramatchPage.jsx"));
const LoginPage       = lazy(() => import("./pages/LoginPage.jsx"));
const RegisterPage    = lazy(() => import("./pages/RegisterPage.jsx"));
const ForgotPassword  = lazy(() => import("./pages/ForgotPassword.jsx"));
const Analysis        = lazy(() => import("./pages/Analysis.jsx"));
const AboutUs         = lazy(() => import("./pages/AboutUs.jsx"));
const MakeupLooks     = lazy(() => import("./pages/MakeupLooks.jsx"));
const AdvisorPage     = lazy(() => import("./pages/AdvisorPage.jsx"));
const CosmeticsPage   = lazy(() => import("./pages/cosmeticPage.jsx"));
const AccountProfile  = lazy(() => import("./pages/AccountProfile.jsx"));
const AnalysisHistory = lazy(() => import("./pages/AnalysisHistory.jsx"));
const Coupons         = lazy(() => import("./pages/Coupons.jsx"));

const AdminDashboard  = lazy(() => import("./pages/admin/AdminDashboard.jsx"));

const isLoggedIn = () => localStorage.getItem("auramatch:isLoggedIn") === "true";
const isAdmin    = () => localStorage.getItem("auramatch:isAdmin") === "true";

function RequireAuth({ children }) {
  const { pathname } = useLocation();
  return isLoggedIn()
    ? children
    : <Navigate to="/login" state={{ from: pathname }} replace />;
}

function RequireAdmin({ children }) {
  const { pathname } = useLocation();
  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: pathname }} replace />;
  }
  return isAdmin()
    ? children
    : <Navigate to="/" replace />;
}

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
            <div className="flex-grow flex items-center justify-center">
              <div className="text-xs tracking-widest animate-pulse text-[#C5A358]">
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

export default function App() {
  return (
    <Router> {/* ✅ ไม่มี basename */}
      <ChromeWrapper>
        <Routes>
          <Route path="/" element={<AuraMatchPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/looks" element={<MakeupLooks />} />
          <Route path="/advisor" element={<AdvisorPage />} />
          <Route path="/cosmetics" element={<CosmeticsPage />} />
          <Route path="/cosmetics/:category" element={<CosmeticsPage />} />

          <Route path="/account" element={<RequireAuth><AccountProfile /></RequireAuth>} />
          <Route path="/history" element={<RequireAuth><AnalysisHistory /></RequireAuth>} />
          <Route path="/coupons" element={<RequireAuth><Coupons /></RequireAuth>} />
          <Route path="/analysis" element={<RequireAuth><Analysis /></RequireAuth>} />

          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/admin/dashboard"
            element={<RequireAdmin><AdminDashboard /></RequireAdmin>}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ChromeWrapper>
    </Router>
  );
}
