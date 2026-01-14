import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const THEME = {
  primary: "#2D2424",      // Deep Espresso
  accent: "#C5A358",       // Champagne Gold
  bg: "#FAF9F9",           // Off-white
  border: "rgba(45, 36, 36, 0.08)",
};

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t" style={{ borderColor: THEME.border }}>
      {/* 1. Newsletter Section (Optional but adds Luxury feel) */}
      <div className="border-b" style={{ borderColor: THEME.border }}>
        <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#2D2424]">
              Subscribe to the AuraMatch
            </h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
              Be the first to receive exclusive beauty analysis tips.
            </p>
          </div>
          <div className="flex w-full md:w-auto border-b border-[#2D2424] pb-1">
            <input 
              type="email" 
              placeholder="YOUR EMAIL" 
              className="bg-transparent text-[10px] tracking-widest uppercase outline-none px-2 w-full md:w-64"
            />
            <button className="text-[10px] font-bold tracking-[0.2em] text-[#2D2424] hover:text-[#C5A358] transition-colors">
              JOIN
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8">
          
          {/* Brand Identity */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-xl font-bold tracking-[0.5em] text-[#2D2424] mb-6">AURAMATCH</h2>
            <p className="text-[11px] leading-relaxed text-gray-500 tracking-wider uppercase">
              AI Beauty Advisor defining your unique elegance through personal color and style analysis.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.3em] text-[#C5A358] uppercase mb-8">Navigation</h4>
            <ul className="flex flex-col gap-4">
              {["Home", "Analysis", "Advisor", "Cosmetics", "Looks"].map((link) => (
                <li key={link}>
                  <Link 
                    to={link === "Home" ? "/" : `/${link.toLowerCase()}`} 
                    className="text-[10px] font-bold text-[#2D2424]/60 hover:text-[#2D2424] tracking-[0.2em] uppercase transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.3em] text-[#C5A358] uppercase mb-8">Customer Care</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/about" className="text-[10px] font-bold text-[#2D2424]/60 hover:text-[#2D2424] tracking-[0.2em] uppercase">About Us</Link></li>
              <li><Link to="/faq" className="text-[10px] font-bold text-[#2D2424]/60 hover:text-[#2D2424] tracking-[0.2em] uppercase">FAQs</Link></li>
              <li><Link to="/privacy" className="text-[10px] font-bold text-[#2D2424]/60 hover:text-[#2D2424] tracking-[0.2em] uppercase">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.3em] text-[#C5A358] uppercase mb-8">Connect</h4>
            <div className="flex flex-col gap-4">
              <a href="mailto:support@auramatch.com" className="text-[10px] font-bold text-[#2D2424]/60 hover:text-[#2D2424] tracking-[0.2em] uppercase">
                support@auramatch.com
              </a>
              <div className="flex gap-6 mt-4">
                <a href="#" className="text-[10px] font-bold text-[#2D2424]/40 hover:text-[#2D2424] tracking-widest uppercase">Instagram</a>
                <a href="#" className="text-[10px] font-bold text-[#2D2424]/40 hover:text-[#2D2424] tracking-widest uppercase">Facebook</a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div className="border-t py-10" style={{ borderColor: THEME.border }}>
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] font-medium tracking-[0.3em] text-gray-400 uppercase">
            © {new Date().getFullYear()} AuraMatch. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            <span className="text-[9px] font-bold tracking-[0.3em] text-gray-400 uppercase cursor-pointer hover:text-[#2D2424]">Terms</span>
            <span className="text-[9px] font-bold tracking-[0.3em] text-gray-400 uppercase cursor-pointer hover:text-[#2D2424]">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}