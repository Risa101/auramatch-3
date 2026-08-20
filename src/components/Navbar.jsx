import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import i18n from "../lib/i18n";
import { useTranslation } from "react-i18next";
import { imgUrl } from "../utils/imgUrl";
import { Menu, X, History, User, LogOut, ShoppingBag } from "lucide-react";

export default function NavbarDailyDose() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [me, setMe] = useState(null);

  const syncUser = useCallback(() => {
    const logged = localStorage.getItem("auramatch:isLoggedIn") === "true";
    const uRaw = JSON.parse(localStorage.getItem("auramatch:user") || "null");
    if (logged && uRaw) {
      setMe({ ...uRaw, photoURL: uRaw.avatar || uRaw.photoURL || "" });
    } else {
      setMe(null);
    }
  }, []);

  useEffect(() => {
    syncUser();
    window.addEventListener("auth:changed", syncUser);
    window.addEventListener("storage", syncUser);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("auth:changed", syncUser);
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [syncUser]);

  useEffect(() => {
    setMobileOpen(false);
    setAcctOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("auramatch:isLoggedIn");
    localStorage.removeItem("auramatch:user");
    localStorage.removeItem("auramatch:token");
    localStorage.removeItem("auramatch:isAdmin");
    window.dispatchEvent(new Event("auth:changed"));
    setAcctOpen(false);
    navigate("/login");
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const navItems = [
    { label: t("nav.home") || "หน้าหลัก", to: "/" },
    { label: t("nav.analysis") || "วิเคราะห์", to: "/analysis" },
    { label: t("nav.advisor") || "คำแนะนำ", to: "/advisor" },
    { label: t("nav.look") || "ลุคของฉัน", to: "/looks" },
    { label: t("nav.cosmetics") || "เครื่องสำอาง", to: "/cosmetics" },
    { label: t("coupon") || "คูปอง", to: "/coupons" },
  ];

  return (
    <>
      {/* ══════════════════════════════════════════
          DESKTOP HEADER — 3 strips
      ══════════════════════════════════════════ */}
      <header className="fixed top-0 w-full z-[100] bg-white hidden lg:block">

        {/* Strip 1 — Announcement (dark, thin) */}
        <div className="bg-[#EBC2C8] text-center py-3">
          <p className="text-[9px] tracking-[0.5em] uppercase text-black/60 font-[400]">
            ค้นหาสีประจำตัวของคุณ &nbsp;·&nbsp;
            <button onClick={() => navigate("/analysis")}
              className="text-[#D23669] underline underline-offset-2 hover:text-white transition-colors duration-200 ml-1">
              เริ่มวิเคราะห์ฟรี
            </button>
          </p>
        </div>

        {/* Strip 2 — Logo row: lang left | logo center | icons right */}
        <div className={`border-b border-[#E0DAD5] transition-all duration-300 ${isScrolled ? "py-4" : "py-6"}`}>
          <div className="max-w-[1180px] mx-auto px-10 grid grid-cols-3 items-center">

            {/* Left: Lang switcher */}
            <div className="flex items-center gap-2">
              <span className="text-base">🇹🇭</span>
              <span className="text-[#E0DAD5] text-xs">|</span>
              {['EN', 'TH'].map((l, i) => (
                <span key={l} className="flex items-center gap-2">
                  <button
                    onClick={() => i18n.changeLanguage(l.toLowerCase())}
                    className={`text-[9px] font-[600] uppercase tracking-[0.35em] transition-colors duration-200 ${
                      i18n.language.toUpperCase() === l ? "text-[#221D1D]" : "text-[#958F8F] hover:text-[#221D1D]"
                    }`}
                  >
                    {l}
                  </button>
                  {i === 0 && <span className="text-[#E0DAD5] text-xs">|</span>}
                </span>
              ))}
            </div>

            {/* Center: Logo */}
            <div className="text-center">
              <Link to="/" onClick={scrollTop} className="group inline-block">
                <h1 className="vs-logo text-[2.6rem] tracking-[0.22em] text-[#221D1D] group-hover:text-[#4E3844] transition-colors duration-300 leading-none">
                  AuraMatch
                </h1>
              </Link>
            </div>

            {/* Right: Account + bag */}
            <div className="flex items-center justify-end gap-5">
              {!me ? (
                <>
                  <Link to="/login" className="text-[10px] font-[600] uppercase tracking-[0.4em] text-[#958F8F] hover:text-[#221D1D] transition-colors">
                    เข้าสู่ระบบ
                  </Link>
                  <Link to="/login" className="text-[#221D1D] hover:text-[#D23669] transition-colors">
                    <ShoppingBag size={18} strokeWidth={1.5} />
                  </Link>
                </>
              ) : (
                <div className="relative flex items-center gap-4">
                  {acctOpen && <div className="fixed inset-0 z-10" onClick={() => setAcctOpen(false)} />}

                  <button onClick={() => setAcctOpen(v => !v)}
                    className="relative z-20 text-[#221D1D] hover:text-[#D23669] transition-colors">
                    <User size={18} strokeWidth={1.5} />
                  </button>

                  <Link to="/cosmetics" className="text-[#221D1D] hover:text-[#D23669] transition-colors">
                    <ShoppingBag size={18} strokeWidth={1.5} />
                  </Link>

                  {/* Dropdown */}
                  {acctOpen && (
                    <div className="absolute right-0 top-full mt-4 w-52 bg-white border border-[#E0DAD5] shadow-lg z-20">
                      <div className="h-0.5 bg-[#D23669] w-full" />
                      <div className="px-5 py-4 border-b border-[#E0DAD5]">
                        <p className="text-[9px] font-[700] uppercase tracking-[0.4em] text-[#221D1D] truncate">{me.name}</p>
                        <p className="text-[8px] font-[400] text-[#958F8F] truncate mt-0.5">{me.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/account" onClick={() => setAcctOpen(false)}
                          className="flex items-center gap-3 px-5 py-3 text-[9px] font-[600] uppercase tracking-[0.35em] text-[#605858] hover:bg-[#F9E2E7] hover:text-[#D23669] transition-colors">
                          <User size={12} /> โปรไฟล์
                        </Link>
                        <Link to="/history" onClick={() => setAcctOpen(false)}
                          className="flex items-center gap-3 px-5 py-3 text-[9px] font-[600] uppercase tracking-[0.35em] text-[#605858] hover:bg-[#F9E2E7] hover:text-[#D23669] transition-colors">
                          <History size={12} /> ประวัติการวิเคราะห์
                        </Link>
                        <div className="h-px bg-[#E0DAD5] mx-4 my-1" />
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-5 py-3 text-[9px] font-[600] uppercase tracking-[0.35em] text-[#4E3844] hover:bg-[#F9E2E7] hover:text-[#D23669] transition-colors">
                          <LogOut size={12} /> ออกจากระบบ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Strip 3 — Navigation links */}
        <div className="border-b border-[#E0DAD5]">
          <nav className="max-w-[1180px] mx-auto px-10 flex items-center justify-center gap-10 py-3.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={scrollTop}
                className={({ isActive }) =>
                  `relative text-[10px] font-[600] uppercase tracking-[0.3em] transition-colors duration-200 pb-2 group
                  ${isActive ? "text-[#221D1D]" : "text-[#958F8F] hover:text-[#221D1D]"}`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    <span className={`absolute bottom-0 left-0 h-[2px] bg-[#4E3844] transition-all duration-300
                      ${isActive ? "w-full" : "w-0 group-hover:w-full"}`} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          MOBILE HEADER — single strip
      ══════════════════════════════════════════ */}
      <header className="fixed top-0 w-full z-[100] bg-white border-b border-[#E0DAD5] lg:hidden">
        <div className="px-5 h-[60px] flex items-center justify-between">
          <Link to="/" onClick={scrollTop} className="vs-logo text-[1.1rem] tracking-[0.2em] text-[#221D1D]">
            AuraMatch
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="text-[#221D1D] hover:text-[#D23669] transition-colors p-1">
            {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </header>

      {/* ── MOBILE FULL-SCREEN OVERLAY ── */}
      <div className={`fixed inset-0 z-[99] bg-[#221D1D] flex flex-col lg:hidden transition-all duration-500
        ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>

        {/* Close */}
        <button onClick={() => setMobileOpen(false)}
          className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors">
          <X size={22} strokeWidth={1.5} />
        </button>

        {/* Logo */}
        <div className="pt-16 px-8 pb-8 border-b border-white/10">
          <p className="vs-logo text-[1.6rem] tracking-[0.22em] text-white">AuraMatch</p>
          <div className="w-8 h-[2px] bg-[#D23669] mt-3" />
        </div>

        {/* Nav links */}
        <nav className="flex flex-col flex-1 justify-center px-8 gap-1">
          {navItems.map((item, idx) => (
            <Link key={item.to} to={item.to} onClick={() => { setMobileOpen(false); scrollTop(); }}
              className={`text-[2.5rem] font-[800] uppercase tracking-[0.04em] leading-tight py-1
                transition-all duration-300
                ${pathname === item.to ? "text-[#D23669]" : "text-white/60 hover:text-white"}`}
              style={{ transitionDelay: mobileOpen ? `${idx * 40}ms` : "0ms" }}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-8 py-8 border-t border-white/10 flex items-center justify-between">
          {!me ? (
            <button onClick={() => { navigate("/login"); setMobileOpen(false); }}
              className="text-[9px] font-[600] uppercase tracking-[0.45em] text-white border border-[#D23669] px-6 py-3 hover:bg-[#D23669] transition-colors">
              เข้าสู่ระบบ
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-[9px] tracking-[0.4em] uppercase text-[#958F8F]">{me.name}</p>
              <div className="flex gap-5">
                <Link to="/account" onClick={() => setMobileOpen(false)}
                  className="text-[9px] font-[600] uppercase tracking-[0.4em] text-white/60">โปรไฟล์</Link>
                <button onClick={handleLogout}
                  className="text-[9px] font-[600] uppercase tracking-[0.4em] text-[#D23669]">ออกจากระบบ</button>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            {['EN', 'TH'].map(l => (
              <button key={l} onClick={() => i18n.changeLanguage(l.toLowerCase())}
                className={`text-[9px] font-[600] uppercase tracking-[0.3em] ${
                  i18n.language.toUpperCase() === l ? "text-[#D23669]" : "text-white/30"}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .vs-logo { font-family: 'Cormorant Garamond', serif; font-variant-caps: small-caps; font-weight: 500; }
        header nav, header div { font-family: 'Montserrat', sans-serif; }
      `}</style>
    </>
  );
}
