import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import i18n from "../lib/i18n";
import { useTranslation } from "react-i18next";
import { ShoppingBag, Menu, X, History, User, LogOut, ChevronDown } from "lucide-react";

export default function NavbarDailyDose() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false); // ควบคุม Dropdown
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
    window.addEventListener("storage", syncUser); // ตรวจจับการเปลี่ยนแปลงข้าม Tab
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("auth:changed", syncUser);
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [syncUser]);

  // ปิดเมนูเมื่อเปลี่ยนหน้า
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

  const navItems = [
    { label: t("nav.home"), to: "/" },
    { label: t("nav.analysis"), to: "/analysis" },
    { label: t("nav.advisor"), to: "/advisor" },
    { label: t("nav.look"), to: "/looks" },
    { label: t("nav.cosmetics"), to: "/cosmetics" },
    { label: t("coupon") || "Coupons", to: "/coupons" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
        isScrolled 
          ? "py-3 bg-white/95 backdrop-blur-md shadow-md" 
          : "py-6 bg-[#FFEBF0]/50"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between relative">
        
        {/* LEFT: BRAND LOGO */}
        <div className="flex-none z-10">
          <Link to="/" className="group block">
            <h1 className="text-2xl font-[900] tracking-tighter text-[#D23669] leading-none transition-transform group-hover:scale-105">
              aura<br/>
              <span className="font-light italic text-[#FF85A2] -mt-1 block">match</span>
            </h1>
          </Link>
        </div>

        {/* CENTER: ALL DESKTOP LINKS */}
        <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                text-[10px] font-black uppercase tracking-widest transition-all px-2 py-1 rounded-lg
                ${isActive ? "text-[#D23669] bg-[#FFEBF0]" : "text-gray-400 hover:text-[#D23669]"}
              `}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT: PROFILE + LANG + SHOPPING */}
        <div className="flex items-center gap-4 z-10">
          {/* Lang Switcher */}
          <div className="hidden md:flex bg-white rounded-full p-1 border border-[#FFD1DC] shadow-sm">
            {['TH', 'EN'].map((l) => (
              <button
                key={l}
                onClick={() => i18n.changeLanguage(l.toLowerCase())}
                className={`px-3 py-1 text-[9px] font-black rounded-full transition-all ${
                  i18n.language.toUpperCase() === l ? "bg-[#D23669] text-white" : "text-gray-300 hover:text-[#D23669]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Account/Login Section */}
          {!me ? (
            <Link to="/login" className="p-2 text-[#D23669] hover:scale-110 transition-transform bg-white rounded-full border border-[#FFD1DC] shadow-sm">
              <ShoppingBag size={20} strokeWidth={2.5} />
            </Link>
          ) : (
            <div className="relative" onMouseEnter={() => setAcctOpen(true)} onMouseLeave={() => setAcctOpen(false)}>
              <button className="flex items-center gap-2 p-1 pr-3 rounded-full border-2 border-[#FFD1DC] hover:border-[#D23669] transition-all bg-white group">
                <div className="w-8 h-8 rounded-full overflow-hidden shadow-inner">
                  <img 
                    src={me.photoURL || `https://ui-avatars.com/api/?name=${me.name}&background=D23669&color=fff`} 
                    className="w-full h-full object-cover" 
                    alt="Profile" 
                  />
                </div>
                <ChevronDown size={14} className={`text-[#D23669] transition-transform duration-300 ${acctOpen ? "rotate-180" : ""}`} />
              </button>

              {/* DROPDOWN MENU */}
              <div className={`absolute right-0 mt-2 w-48 bg-white border-2 border-black rounded-[24px] p-2 shadow-[8px_8px_0px_0px_rgba(210,54,105,0.2)] transition-all duration-300 ${acctOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
                <div className="px-4 py-3 border-b border-gray-100 mb-2">
                  <p className="text-[10px] font-black text-[#D23669] uppercase truncate">{me.name}</p>
                  <p className="text-[8px] font-bold text-gray-400 truncate">{me.email}</p>
                </div>
                
                <Link to="/account" className="flex items-center gap-3 p-3 text-[10px] font-black uppercase text-gray-600 hover:bg-[#FFEBF0] rounded-xl transition-colors">
                  <User size={16} className="text-[#D23669]" /> Profile
                </Link>
                <Link to="/history" className="flex items-center gap-3 p-3 text-[10px] font-black uppercase text-gray-600 hover:bg-[#FFEBF0] rounded-xl transition-colors">
                  <History size={16} className="text-[#D23669]" /> History
                </Link>
                
                <div className="h-px bg-gray-100 my-2 mx-2" />
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}

          {/* Mobile Toggle */}
          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="lg:hidden text-[#D23669] p-1 hover:bg-[#FFEBF0] rounded-full transition-colors"
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`fixed inset-0 bg-[#FFEBF0] z-[99] pt-32 px-10 transition-all duration-500 ease-in-out lg:hidden ${mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"}`}>
        <nav className="flex flex-col gap-4 text-center">
          {navItems.map((item, idx) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-4xl font-[900] uppercase tracking-tighter text-[#D23669] hover:scale-105 transition-all ${mobileOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
              style={{ transitionDelay: `${idx * 50}ms` }}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          
          <div className="h-[2px] bg-[#D23669]/10 my-6" />
          
          {!me ? (
            <button 
              onClick={() => { navigate("/login"); setMobileOpen(false); }}
              className="bg-[#D23669] text-white py-4 rounded-full font-black uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(210,54,105,0.4)]"
            >
              Sign In
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/account" onClick={() => setMobileOpen(false)} className="text-[#D23669] font-black uppercase tracking-widest">My Account</Link>
              <button onClick={handleLogout} className="text-red-500 font-black uppercase tracking-widest">Sign Out</button>
            </div>
          )}
        </nav>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');
        header { font-family: 'Montserrat', sans-serif; }
      `}</style>
    </header>
  );
}
