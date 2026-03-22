import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

// Layout pieces
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DiscountBanner from "./components/DiscountBanner";
import ErrorBoundary from "./components/ErrorBoundary";
import "./lib/i18n";

// ── Lazy pages (User Side) ────────────────────────────────────────────────────
const AuraMatchPage   = lazy(() => import("./pages/AuramatchPage.jsx"));
const LoginPage       = lazy(() => import("./pages/LoginPage.jsx"));
const RegisterPage    = lazy(() => import("./pages/RegisterPage.jsx"));
const ForgotPassword  = lazy(() => import("./pages/ForgotPassword.jsx"));
const ResetPassword   = lazy(() => import("./pages/ResetPassword.jsx"));
const Analysis        = lazy(() => import("./pages/Analysis.jsx"));
const AboutUs         = lazy(() => import("./pages/AboutUs.jsx"));
const MakeupLooks     = lazy(() => import("./pages/MakeupLooks.jsx"));
const AdvisorPage     = lazy(() => import("./pages/AdvisorPage.jsx"));
const CosmeticsPage   = lazy(() => import("./pages/cosmeticPage.jsx"));
const AccountProfile  = lazy(() => import("./pages/AccountProfile.jsx"));
const AnalysisHistory = lazy(() => import("./pages/AnalysisHistory.jsx"));
const Coupons         = lazy(() => import("./pages/Coupons.jsx"));

// ── Lazy pages (Admin Side) ───────────────────────────────────────────────────
const SalesDashboard  = lazy(() => import("./pages/admin/SalesDashboard.jsx"));

// ── Helpers ───────────────────────────────────────────────────────────────────
const isLoggedIn = () => localStorage.getItem("auramatch:isLoggedIn") === "true";
const hasToken = () => Boolean(localStorage.getItem("auramatch:token"));
const isAdmin    = () => localStorage.getItem("auramatch:isAdmin") === "true";
const hasSession = () => isLoggedIn() && hasToken();

// ── Route guards ──────────────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { pathname } = useLocation();
  return hasSession() ? children : <Navigate to="/login" state={{ from: pathname }} replace />;
}

function RequireAdmin({ children }) {
  const { pathname } = useLocation();
  if (!hasSession()) return <Navigate to="/login" state={{ from: pathname }} replace />;
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
        <Suspense fallback={<LoadingUI />}>
          {children}
        </Suspense>
      </main>
      {!hideChrome && <Footer />}
    </div>
  );
}

function LoadingUI() {
  return (
    <div className="flex-grow flex items-center justify-center bg-[#FDFCFB]">
      <div className="text-[10px] tracking-[0.5em] font-bold uppercase text-[#C5A358] animate-pulse">
        AuraMatch Atelier...
      </div>
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
    <Router basename="/">
      <ChromeWrapper>
        <Routes>
          <Route path="/"                   element={<AuraMatchPage />} />
          <Route path="/login"              element={<LoginPage />} />
          <Route path="/register"           element={<RegisterPage />} />
          <Route path="/forgot-password"    element={<ForgotPassword />} />
          <Route path="/reset-password"     element={<ResetPassword />} />
          <Route path="/about"              element={<AboutUs />} />
          <Route path="/looks"              element={<MakeupLooks />} />
          <Route path="/advisor"            element={<AdvisorPage />} />
          <Route path="/cosmetics"          element={<CosmeticsPage />} />
          <Route path="/cosmetics/:category" element={<CosmeticsPage />} />
          <Route path="/account"            element={<AccountProfile />} />
          <Route path="/history"            element={<AnalysisHistory />} />
          <Route path="/coupons"            element={<Coupons />} />
          <Route path="/analysis"           element={<RequireAuth><Analysis /></RequireAuth>} />

          {/* Admin Routes - จัดการผ่าน SalesDashboard ไฟล์เดียว */}
          <Route path="/admin/*" element={<RequireAdmin><SalesDashboard /></RequireAdmin>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </ChromeWrapper>
    </Router>
    </ErrorBoundary>
  );
}

function NotFound() {
  return (
    <div className="pt-40 text-center font-serif italic">
      <h2 className="text-4xl text-[#1A1A1A]">Page Not Found</h2>
      <p className="text-[#C5A358] mt-4 uppercase tracking-widest text-xs">Error 404</p>
    </div>
  );
}
