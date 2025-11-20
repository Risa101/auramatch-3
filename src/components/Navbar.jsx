// src/components/Navbar.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import logoUrl from "/assets/logo.png";
import i18n from "../lib/i18n";
import { useTranslation } from "react-i18next";

/* Theme */
const COLORS = {
  accent: "#E6DCEB",
  primary: "#75464A",
  hoverPink: "#FFB3C6",
  base: "#FADCDC",
  hover: "#D85E79",
};

const tabBase =
  "group relative rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6DCEB]";
const tabIdle =
  "text-[#75464A] hover:bg-[#FFB3C6] hover:text-white hover:shadow-[0_10px_22px_rgba(255,179,198,.35)] active:scale-[.98] active:shadow-[0_6px_16px_rgba(255,179,198,.35)]";

/* Utils */
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) handler();
    }
    function onKey(e) {
      if (e.key === "Escape") handler();
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, handler]);
}
function getInitials(name) {
  if (!name) return "U";
  const p = name.trim().split(/\s+/).slice(0, 2);
  return p.map((s) => s[0]?.toUpperCase() || "").join("") || "U";
}
function colorFromString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return `hsl(${h} 70% 45%)`;
}

/* Language Switcher */
function LanguageSwitcher({ compact = false }) {
  const [lang, setLang] = useState(
    () => i18n?.language || localStorage.getItem("lang") || "th"
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const onChange = (next) => {
    setLang(next);
    try {
      i18n?.changeLanguage?.(next);
    } catch {}
    localStorage.setItem("lang", next);
    document.documentElement.lang = next;
    window.dispatchEvent(new Event("lang:changed"));
  };

  if (compact) {
    // mobile / compact version
    return (
      <div className="inline-flex items-center gap-1">
        <button
          onClick={() => onChange("th")}
          className={`rounded-lg border px-2 py-1 text-xs font-medium ${
            lang === "th" ? "bg-[#FFB3C6] text-white" : "bg-white text-[#75464A]"
          }`}
          style={{ borderColor: COLORS.accent }}
          aria-pressed={lang === "th"}
        >
          🇹🇭 TH
        </button>
        <button
          onClick={() => onChange("en")}
          className={`rounded-lg border px-2 py-1 text-xs font-medium ${
            lang === "en" ? "bg-[#FFB3C6] text-white" : "bg-white text-[#75464A]"
          }`}
          style={{ borderColor: COLORS.accent }}
          aria-pressed={lang === "en"}
        >
          🇬🇧 EN
        </button>
      </div>
    );
  }

  // desktop select
  return (
    <div className="relative">
      <select
        value={lang}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border bg-white px-3 py-2 text-sm font-medium text-[#75464A] shadow-sm hover:bg-[#FFB3C6]/20 focus:outline-none focus:ring-2 focus:ring-[#E6DCEB]"
        style={{ borderColor: COLORS.accent }}
        aria-label="Language"
      >
        <option value="th">🇹🇭 ไทย</option>
        <option value="en">🇬🇧 English</option>
      </select>
    </div>
  );
}

/* Component */
export default function Navbar() {
  const { t } = useTranslation(); // ✅ ใช้แปลข้อความ

  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deskOpen, setDeskOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [avatarOk, setAvatarOk] = useState(true);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const headerRef = useRef(null);
  const lastY = useRef(0);
  const acctRef = useRef(null);

  useOnClickOutside(acctRef, () => setAcctOpen(false));

  // อ่านสถานะจาก localStorage
  useEffect(() => {
    const setFromLS = () => {
      try {
        const logged = localStorage.getItem("auramatch:isLoggedIn") === "true";
        const uRaw = JSON.parse(localStorage.getItem("auramatch:user") || "null");
        const photoURL = uRaw
          ? uRaw.avatar || uRaw.photoURL || uRaw.photo || ""
          : "";
        const normalized = uRaw ? { ...uRaw, photoURL } : null;
        setMe(logged ? normalized : null);
      } catch {
        setMe(null);
      }
    };
    setFromLS();
    window.addEventListener("storage", setFromLS);
    window.addEventListener("coupon:changed", setFromLS);
    window.addEventListener("user:updated", setFromLS);
    window.addEventListener("auth:changed", setFromLS);
    window.addEventListener("lang:changed", setFromLS);
    return () => {
      window.removeEventListener("storage", setFromLS);
      window.removeEventListener("coupon:changed", setFromLS);
      window.removeEventListener("user:updated", setFromLS);
      window.removeEventListener("auth:changed", setFromLS);
      window.removeEventListener("lang:changed", setFromLS);
    };
  }, []);

  useEffect(() => setAvatarOk(true), [me?.photoURL]);

  // ปิดเมนูเมื่อเปลี่ยนหน้า
  useEffect(() => {
    setOpen(false);
    setAcctOpen(false);
    setDeskOpen(false);
  }, [pathname]);

  // hide-on-scroll + progress
  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const dirDown = y > lastY.current;
        const delta = Math.abs(y - lastY.current);
        if (y < 16) setHidden(false);
        else if (delta > 6) setHidden(dirDown);
        lastY.current = y;

        const doc = document.documentElement;
        const max = (doc.scrollHeight || 0) - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, y / max) : 0);
        ticking = false;
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // subtle cursor glow
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    function move(e) {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    }
    el.addEventListener("mousemove", move);
    return () => el.removeEventListener("mousemove", move);
  }, []);

  const activePinkStyle = useCallback(
    (isActive) => ({
      background: isActive
        ? `linear-gradient(90deg, ${COLORS.hoverPink}, ${COLORS.hoverPink})`
        : "transparent",
      color: isActive ? "#fff" : COLORS.primary,
      boxShadow: isActive ? "0 10px 22px rgba(255,179,198,.35)" : "none",
    }),
    []
  );

  function TopButtonLikeCosmetic({ label, to, exact = false }) {
    const { pathname } = useLocation();
    const isActive = exact ? pathname === to : pathname.startsWith(to === "/" ? "/" : to);
    const navigate = useNavigate();
    return (
      <button
        type="button"
        onClick={() => navigate(to)}
        className={[tabBase, tabIdle].join(" ")}
        style={activePinkStyle(isActive)}
      >
        <span className="relative">
          {label}
          <span className="pointer-events-none absolute inset-x-0 -bottom-1 block h-[2px] origin-left scale-x-0 rounded-full bg-white/70 transition-transform duration-300 group-hover:scale-x-100" />
        </span>
      </button>
    );
  }

  const initials = useMemo(() => getInitials(me?.name || me?.email || ""), [me]);
  const seedColor = useMemo(
    () => colorFromString(me?.email || me?.name || "guest"),
    [me]
  );

  const navigateHook = useNavigate();
  const logout = () => {
    localStorage.setItem("auramatch:isLoggedIn", "false");
    window.dispatchEvent(new Event("auth:changed"));
    window.dispatchEvent(new Event("coupon:changed"));
    navigateHook("/login", { replace: true });
  };

  const Avatar = ({ size = 40, className = "" }) => {
    const photoSrc = me?.photoURL || "";
    const showImg = !!photoSrc && avatarOk;
    return (
      <div
        className={`overflow-hidden rounded-full border ${className}`}
        style={{ width: size, height: size, borderColor: COLORS.accent }}
      >
        {showImg ? (
          <img
            src={photoSrc}
            alt="account"
            width={size}
            height={size}
            loading="lazy"
            decoding="async"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onError={() => setAvatarOk(false)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="grid h-full w-full place-items-center font-semibold text-white"
            style={{ background: seedColor }}
          >
            {initials}
          </span>
        )}
      </div>
    );
  };

  return (
    <header
      ref={headerRef}
      className={[
        "sticky top-0 z-50 border-b backdrop-blur-md",
        "transition-transform duration-300 will-change-transform",
        hidden ? "-translate-y-full" : "translate-y-0",
      ].join(" ")}
      style={{
        borderColor: COLORS.accent,
        fontFamily: "Poppins, ui-sans-serif, system-ui, -apple-system",
        background:
          "linear-gradient(to bottom, rgba(255,255,255,.82), rgba(255,255,255,.68))",
        backgroundImage:
          "radial-gradient(220px 140px at var(--mx, -100px) var(--my, -100px), rgba(216,94,121,.08), transparent 60%)",
      }}
      aria-label="Site Navigation"
    >
      {/* hairline + progress */}
      <div
        className="h-0.5 w-full"
        style={{
          background: `linear-gradient(90deg, ${COLORS.base}, ${COLORS.accent})`,
        }}
      />
      <div className="relative h-0.5 w-full bg-transparent">
        <div
          className="absolute left-0 top-0 h-0.5"
          style={{
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${COLORS.hoverPink}, ${COLORS.hover} 60%, #b87ae2)`,
            boxShadow: "0 0 10px rgba(216,94,121,.35)",
            transition: "width .15s linear",
          }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-3 md:px-6 md:py-4">
        {/* Logo + Brand */}
        <Link to="/" className="group inline-flex items-center gap-2">
          <img
            src={logoUrl}
            alt="AuraMatch logo"
            className="h-7 w-7 rounded-lg shadow-sm transition group-hover:scale-[1.04]"
            loading="eager"
            decoding="async"
          />
          <div
            className="relative rounded-xl px-3 py-1 text-sm font-extrabold tracking-wide shadow-sm ring-1 transition group-hover:-translate-y-0.5"
            style={{
              color: COLORS.primary,
              backgroundColor: "#fff",
              borderColor: COLORS.accent,
              boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            }}
          >
            <span className="relative z-10">AURAMATCH</span>
          </div>
          <span className="hidden text-xs text-[#75464A]/60 md:block">
            {t("nav.tagline")}
          </span>
        </Link>

        {/* เมนูกลาง/ขวา (Desktop) */}
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <TopButtonLikeCosmetic label={t("nav.home")} to="/" exact />
          <TopButtonLikeCosmetic
            label={t("nav.analysis")}
            to="/analysis"
          />
          <TopButtonLikeCosmetic
            label={t("nav.advisor")}
            to="/advisor"
          />
          <TopButtonLikeCosmetic
            label={t("nav.coupons")}
            to="/coupons"
          />
          <TopButtonLikeCosmetic label={t("nav.about")} to="/about" />
          <TopButtonLikeCosmetic label={t("nav.look")} to="/looks" />

          {/* Cosmetics dropdown */}
          <div
            className="relative group"
            onMouseEnter={() => setDeskOpen(true)}
            onMouseLeave={() => setDeskOpen(false)}
          >
            <button
              type="button"
              className={[tabBase, tabIdle, "pr-7"].join(" ")}
              aria-haspopup="menu"
              aria-expanded={deskOpen}
              style={activePinkStyle(pathname.startsWith("/cosmetics"))}
            >
              <span className="relative flex items-center gap-2">
                <span>{t("nav.cosmetics")}</span>
                <span className="pointer-events-none text-xs" aria-hidden>
                  ▼
                </span>
                <span className="pointer-events-none absolute inset-x-0 -bottom-1 block h-[2px] origin-left scale-x-0 rounded-full bg-white/70 transition-transform duration-300 group-hover:scale-x-100" />
              </span>
            </button>

            <span className="absolute left-0 top-full block h-2 w-full" />

            <div
              className={[
                "absolute left-0 top-full z-50 mt-2 min-w-[220px] rounded-2xl border bg-white/95 p-2 shadow-xl backdrop-blur transition duration-200",
                deskOpen
                  ? "visible opacity-100 pointer-events-auto"
                  : "invisible opacity-0 pointer-events-none",
                "group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto",
              ].join(" ")}
              style={{ borderColor: COLORS.accent }}
              role="menu"
              aria-label="Cosmetics submenu"
            >
              <div className="space-y-1">
                {[
                  { label: t("cos.all"), to: "/cosmetics" },
                  { label: t("cos.blush"), to: "/cosmetics/blush" },
                  { label: t("cos.contour"), to: "/cosmetics/contour" },
                  { label: t("cos.concealer"), to: "/cosmetics/concealer" },
                  { label: t("cos.gloss"), to: "/cosmetics/gloss" },
                  { label: t("cos.cushion"), to: "/cosmetics/cushion" },
                ].map((sub) => (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    className={({ isActive }) =>
                      [
                        "block rounded-md px-3 py-2 text-sm transition",
                        isActive ? "text-white" : "text-[#75464A]",
                        "hover:bg-[#FFB3C6] hover:text-white hover:shadow-[0_10px_22px_rgba(255,179,198,.35)] active:scale-[.98]",
                      ].join(" ")
                    }
                    style={({ isActive }) => ({
                      background: isActive
                        ? `linear-gradient(90deg, ${COLORS.hoverPink}, ${COLORS.hoverPink})`
                        : "transparent",
                    })}
                    role="menuitem"
                  >
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

          {/* Language Switcher (desktop) */}
          <div className="ml-2">
            <LanguageSwitcher />
          </div>
        </nav>

        {/* ขวาสุด: Account / Login */}
        <div className="ml-2 hidden items-center gap-2 md:flex">
          {!me ? (
            <button
              onClick={() => navigate("/login")}
              className={[tabBase, tabIdle].join(" ")}
            >
              {t("nav.login")}
            </button>
          ) : (
            <div className="relative" ref={acctRef}>
              <button
                onClick={() => setAcctOpen((v) => !v)}
                className="h-10 w-10 rounded-full border bg-white shadow-sm"
                style={{ borderColor: COLORS.accent, overflow: "hidden" }}
                aria-label="Open account menu"
                aria-haspopup="menu"
                aria-expanded={acctOpen}
                title={me?.name || me?.email}
              >
                <Avatar size={40} />
              </button>

              {acctOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl border bg-white/95 p-2 shadow-xl backdrop-blur"
                  style={{ borderColor: COLORS.accent }}
                  role="menu"
                  aria-label="Account"
                >
                  <div
                    className="flex items-center gap-2 border-b pb-2"
                    style={{ borderColor: COLORS.accent }}
                  >
                    <Avatar size={40} />
                    <div>
                      <div className="text-sm font-semibold text-[#75464A]">
                        {me?.name || "User"}
                      </div>
                      <div className="text-xs text-[#75464A]/70">
                        {me?.email}
                      </div>
                    </div>
                  </div>

                  <NavLink
                    to="/account"
                    className="block rounded-md px-3 py-2 text-sm text-[#75464A] hover:bg-[#FFB3C6] hover:text-white"
                    role="menuitem"
                  >
                    {t("nav.account")}
                  </NavLink>
                  <NavLink
                    to="/history"
                    className="block rounded-md px-3 py-2 text-sm text-[#75464A] hover:bg-[#FFB3C6] hover:text-white"
                    role="menuitem"
                  >
                    {t("nav.history")}
                  </NavLink>
                  <div
                    className="my-1 h-px"
                    style={{ background: COLORS.accent }}
                  />
                  <button
                    onClick={logout}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-[#B02A37] hover:bg-[#FFE5EA]"
                    role="menuitem"
                  >
                    {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* burger (mobile) */}
        <button
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
          onClick={() => {
            setOpen((v) => !v);
            setAcctOpen(false);
          }}
          className="ml-2 grid h-10 w-10 place-items-center rounded-xl border bg-white text-[#75464A] shadow-sm md:hidden"
          style={{ borderColor: COLORS.accent }}
        >
          <div className="relative h-4 w-5">
            <span
              className={`absolute left-0 top-0 block h-0.5 w-5 bg-[#75464A] transition-transform ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-2 block h-0.5 w-5 bg-[#75464A] transition-opacity ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 top-4 block h-0.5 w-5 bg-[#75464A] transition-transform ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out ${
          open
            ? "opacity-100 max-h-[700px] translate-y-0"
            : "opacity-0 max-h-0 -translate-y-2"
        }`}
        style={{
          backgroundColor: "rgba(255,255,255,0.96)",
          borderTop: `1px solid ${COLORS.accent}`,
          boxShadow: open ? "0 12px 28px rgba(0,0,0,.08)" : "none",
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 md:px-6">
          {/* Language Switcher (mobile compact) */}
          <div className="mb-2">
            <LanguageSwitcher compact />
          </div>

          {me && (
            <div
              className="mb-2 flex items-center gap-3 rounded-xl border bg-white/80 p-3"
              style={{ borderColor: COLORS.accent }}
            >
              <Avatar size={40} />
              <div className="text-sm">
                <div className="font-semibold text-[#75464A]">
                  {me?.name || "User"}
                </div>
                <div className="text-[#75464A]/70 text-xs">
                  {me?.email}
                </div>
              </div>
              <div className="ml-auto">
                <button
                  onClick={logout}
                  className="rounded-md border px-2 py-1 text-xs text-[#B02A37]"
                >
                  {t("nav.logout")}
                </button>
              </div>
            </div>
          )}

          {[
            { label: t("nav.home"), to: "/" },
            { label: t("nav.analysis"), to: "/analysis" },
            { label: t("nav.advisor"), to: "/advisor" },
            { label: t("nav.coupons"), to: "/coupons" },
            { label: t("nav.about"), to: "/about" },
            { label: t("nav.look"), to: "/looks" },
          ].map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                [
                  "rounded-md px-3 py-2 text-sm font-medium transition",
                  isActive ? "text-white shadow-sm" : "text-[#75464A]",
                  "hover:bg-[#FFB3C6] hover:text-white hover:shadow-[0_10px_22px_rgba(255,179,198,.35)] active:scale-[.98]",
                ].join(" ")
              }
              style={({ isActive }) => ({
                background: isActive
                  ? `linear-gradient(90deg, ${COLORS.hoverPink}, ${COLORS.hoverPink})`
                  : "transparent",
              })}
            >
              {item.label}
            </NavLink>
          ))}

          {/* Cosmetics dropdown (mobile) */}
          <div className="rounded-md">
            <details>
              <summary className="list-none rounded-md px-3 py-2 text-sm font-medium text-[#75464A] transition hover:bg-[#FFB3C6] hover:text-white cursor-pointer">
                {t("nav.cosmetics")}
              </summary>
              <div
                className="mt-1 rounded-md border bg-white/80 p-1"
                style={{ borderColor: COLORS.accent }}
              >
                {[
                  { label: t("cos.all"), to: "/cosmetics" },
                  { label: t("cos.blush"), to: "/cosmetics/blush" },
                  { label: t("cos.contour"), to: "/cosmetics/contour" },
                  { label: t("cos.concealer"), to: "/cosmetics/concealer" },
                  { label: t("cos.gloss"), to: "/cosmetics/gloss" },
                  { label: t("cos.cushion"), to: "/cosmetics/cushion" },
                ].map((sub) => (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      [
                        "block rounded-md px-4 py-2 text-sm transition",
                        isActive ? "text-white" : "text-[#75464A]",
                        "hover:bg-[#FFB3C6] hover:text-white hover:shadow-[0_10px_22px_rgba(255,179,198,.35)] active:scale-[.98]",
                      ].join(" ")
                    }
                    style={({ isActive }) => ({
                      background: isActive
                        ? `linear-gradient(90deg, ${COLORS.hoverPink}, ${COLORS.hoverPink})`
                        : "transparent",
                    })}
                  >
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            </details>
          </div>

          {!me && (
            <NavLink
              to="/login"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-md px-3 py-2 text-sm font-medium text-[#75464A] transition hover:bg-[#FFB3C6] hover:text-white"
              style={{ border: `1px solid ${COLORS.accent}` }}
            >
              {t("nav.login")}
            </NavLink>
          )}
        </div>
      </div>

      <div
        className="h-px w-full"
        style={{ background: COLORS.accent }}
      />
    </header>
  );
}
