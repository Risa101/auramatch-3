import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import i18n from "../lib/i18n";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [me, setMe] = useState(null);

  // ฟังก์ชันดึงข้อมูลผู้ใช้ใหม่ล่าสุดจาก LocalStorage
  const syncUser = useCallback(() => {
    const logged = localStorage.getItem("auramatch:isLoggedIn") === "true";
    const uRaw = JSON.parse(localStorage.getItem("auramatch:user") || "null");
    
    if (logged && uRaw) {
      setMe({ 
        ...uRaw, 
        // ตรวจสอบทั้ง avatar และ photoURL เผื่อมีการใช้ชื่อ Key ที่ต่างกัน
        photoURL: uRaw.avatar || uRaw.photoURL || "" 
      });
    } else {
      setMe(null);
    }
  }, []);

  useEffect(() => {
    syncUser();
    // ฟังคำสั่ง "auth:changed" เพื่ออัปเดตรูปและชื่อทันที
    window.addEventListener("auth:changed", syncUser);
    // ฟังคำสั่ง "storage" เผื่อมีการเปลี่ยนจาก Tab อื่น
    window.addEventListener("storage", syncUser);

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
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

  const logout = () => {
    localStorage.removeItem("auramatch:isLoggedIn");
    localStorage.removeItem("auramatch:user"); // ล้างข้อมูล user ออกด้วย
    window.dispatchEvent(new Event("auth:changed"));
    navigate("/login");
  };

  const navItems = [
    { label: t("nav.home"), to: "/" },
    { label: t("nav.analysis"), to: "/analysis" },
    { label: t("nav.advisor"), to: "/advisor" },
    { label: t("nav.look"), to: "/looks" },
    { label: t("nav.cosmetics"), to: "/cosmetics" },
    { label: t("nav.coupons"), to: "/coupons" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
        isScrolled 
          ? "py-4 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" 
          : "py-7 bg-transparent"
      }`}
    >
      <div className="max-w-[1500px] mx-auto px-8 md:px-16 flex items-center justify-between">
        
        {/* BRAND LOGO */}
        <Link to="/" className="shrink-0 group relative z-[101]">
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-serif font-medium tracking-tight text-[#1A1A1A]">AuraMatch</span>
            <span className="text-[9px] font-sans font-bold tracking-[0.4em] text-[#D4AF37] uppercase mt-1">Atelier</span>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-12">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                relative py-1 font-tenor text-[12px] tracking-[0.2em] uppercase transition-all duration-300
                ${isActive ? "text-[#1A1A1A]" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"}
              `}
            >
              {({ isActive }) => (
                <div className="flex flex-col items-center">
                  <span className="grid place-items-center">
                    <span className="invisible font-bold h-0 col-start-1 row-start-1">{item.label}</span>
                    <span className={`${isActive ? "font-bold" : "font-normal"} col-start-1 row-start-1 transition-all`}>{item.label}</span>
                  </span>
                  <span className={`absolute -bottom-1 h-[1px] bg-[#D4AF37] transition-all duration-500 ${isActive ? "w-full" : "w-0"}`} />
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-6 xl:gap-10">
          <div className="hidden md:flex items-center gap-4">
            {['TH', 'EN'].map((l) => (
              <button
                key={l}
                onClick={() => i18n.changeLanguage(l.toLowerCase())}
                className={`font-jost text-[11px] font-bold tracking-widest ${
                  i18n.language.toUpperCase() === l ? "text-[#D4AF37]" : "text-gray-300 hover:text-[#1A1A1A]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {!me ? (
            <Link to="/login" className="px-8 py-2.5 bg-[#1A1A1A] text-white font-jost text-[10px] font-bold tracking-widest uppercase hover:bg-[#D4AF37] transition-all shadow-md">
              {t("nav.login")}
            </Link>
          ) : (
            <div className="relative" onMouseEnter={() => setAcctOpen(true)} onMouseLeave={() => setAcctOpen(false)}>
              <button className="flex items-center outline-none">
                <div className="w-10 h-10 rounded-full border-2 border-transparent hover:border-[#D4AF37] overflow-hidden transition-all duration-300 shadow-sm">
                  {/* แสดงรูปจาก me.photoURL ที่อัปเดตแล้ว */}
                  <img 
                    key={me.photoURL} // ใช้ key เพื่อบังคับให้ React re-render รูปเมื่อ URL เปลี่ยน
                    src={me.photoURL || `https://ui-avatars.com/api/?name=${me.name}`} 
                    className="w-full h-full object-cover" 
                    alt="Profile" 
                  />
                </div>
              </button>

              <div className={`absolute right-0 mt-0 pt-4 w-56 transition-all duration-500 ${acctOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>
                <div className="bg-white shadow-2xl border border-gray-50 p-6">
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <p className="font-serif text-base italic text-[#1A1A1A] truncate">{me.name || "Member"}</p>
                    <p className="text-[9px] font-jost text-[#D4AF37] uppercase tracking-[0.1em] mt-1">Premium Member</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Link to="/account" className="font-jost text-[10px] font-bold text-[#1A1A1A]/60 hover:text-[#D4AF37] uppercase tracking-[0.2em] transition-colors">{t("nav.account")}</Link>
                    <Link to="/history" className="font-jost text-[10px] font-bold text-[#1A1A1A]/60 hover:text-[#D4AF37] uppercase tracking-[0.2em] transition-colors">{t("nav.history")}</Link>
                    <button onClick={logout} className="text-[10px] font-bold text-red-400 hover:text-red-600 text-left uppercase tracking-[0.2em] transition-colors mt-2">Logout</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden flex flex-col gap-1.5 z-[101] p-2">
            <span className={`h-px bg-[#1A1A1A] transition-all duration-300 w-6 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`h-px bg-[#1A1A1A] transition-all duration-300 w-6 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`h-px bg-[#1A1A1A] transition-all duration-300 w-6 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* FULL SCREEN MENU */}
      <div className={`fixed inset-0 bg-[#FDFCFB] z-[99] flex flex-col items-center justify-center transition-all duration-700 ease-expo ${mobileOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}>
        <nav className="flex flex-col items-center gap-8">
          {[...navItems, {label: t("nav.history"), to: "/history"}].map((item, idx) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-4xl font-serif italic text-[#1A1A1A] hover:text-[#D4AF37] transition-all duration-500 ${mobileOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
              style={{ transitionDelay: `${idx * 70}ms` }}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Jost:wght@500;700&family=Tenor+Sans&display=swap');
        html { scrollbar-gutter: stable; }
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-jost { font-family: 'Jost', sans-serif; }
        .font-tenor { font-family: 'Tenor Sans', sans-serif; }
        .ease-expo { transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1); }
      `}</style>
    </header>
  );
}