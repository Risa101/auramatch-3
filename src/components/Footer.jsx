import { Link } from "react-router-dom";
import { Instagram, Youtube } from "lucide-react";

export default function FooterDailyDose() {
  return (
    <footer className="font-sans">

      {/* ── STRIP 1: Black — Stay in the Know ── */}
      <div className="bg-[#EBC2C8] text-black text-center py-10 px-5">
        <h3 className="text-[2rem] md:text-[2.5rem] font-[800] uppercase tracking-[0.08em] leading-tight mb-4">
          ไม่พลาดทุกอัปเดต
        </h3>
        <p className="text-[12px] font-[400] text-black/60 tracking-[0.05em] max-w-lg mx-auto mb-8">
          รับสิทธิพิเศษ เทรนด์ล่าสุด และสินค้าใหม่ ส่งตรงถึงอีเมลคุณ
        </p>
        <Link to="/analysis"
          className="inline-block text-[11px] font-[700] uppercase tracking-[0.35em] text-black border-b border-black pb-0.5 hover:text-white/60 hover:border-white/60 transition-colors duration-200">
          สมัครรับข่าวสาร
        </Link>
      </div>

      {/* ── STRIP 2: Light gray — links + social ── */}
      <div className="bg-[#F5F5F6] px-6 md:px-12 py-14">
        <div className="max-w-[1180px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr] gap-12">

          {/* Left: CTA button + social */}
          <div className="flex flex-col gap-6">
            <Link to="/"
              className="inline-flex items-center justify-center border-[2px] border-[#221D1D] px-6 py-4 text-[9px] font-[700] uppercase tracking-[0.45em] text-[#221D1D] hover:bg-[#221D1D] hover:text-white transition-all duration-200 self-start">
              สมัครรับข่าวสาร
            </Link>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: <Instagram size={16} strokeWidth={1.5} />, href: "#" },
                { icon: <Youtube size={16} strokeWidth={1.5} />, href: "#" },
              ].map((s, i) => (
                <a key={i} href={s.href}
                  className="w-9 h-9 border border-[#C0C0C0] flex items-center justify-center text-[#221D1D] hover:border-[#221D1D] hover:bg-[#221D1D] hover:text-white transition-all duration-200">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Center: Help */}
          <div>
            <p className="text-[9px] font-[700] uppercase tracking-[0.45em] text-[#221D1D] mb-5">ช่วยเหลือ</p>
            <ul className="flex flex-col gap-3">
              {[
                { name: "ฝ่ายบริการลูกค้า", to: "/about" },
                { name: "เกี่ยวกับ AuraMatch", to: "/about" },
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.to}
                    className="text-[12px] font-[400] text-[#605858] hover:text-[#221D1D] transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Explore */}
          <div>
            <p className="text-[9px] font-[700] uppercase tracking-[0.45em] text-[#221D1D] mb-5">สำรวจ</p>
            <ul className="flex flex-col gap-3">
              {[
                { name: "วิเคราะห์สีประจำตัว", to: "/analysis" },
                { name: "คำแนะนำสไตล์", to: "/advisor" },
                { name: "ลุคแต่งหน้า", to: "/looks" },
                { name: "เครื่องสำอาง", to: "/cosmetics" },
                { name: "คูปอง", to: "/coupons" },
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.to}
                    className="text-[12px] font-[400] text-[#605858] hover:text-[#221D1D] transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── STRIP 3: White — copyright + legal ── */}
      <div className="bg-white border-t border-[#E0DAD5] px-6 md:px-12 py-6">
        <div className="max-w-[1180px] mx-auto flex flex-col gap-2">
          <p className="text-[11px] font-[400] text-[#605858]">
            © {new Date().getFullYear()} AuraMatch สงวนลิขสิทธิ์
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {["ข้อกำหนดการใช้งาน", "ความเป็นส่วนตัวและความปลอดภัย", "ติดต่อเรา", "เข้าสู่ระบบ"].map((item, i, arr) => (
              <span key={item} className="flex items-center gap-3">
                <Link to="/about"
                  className="text-[10px] font-[400] text-[#958F8F] hover:text-[#221D1D] transition-colors duration-200">
                  {item}
                </Link>
                {i < arr.length - 1 && <span className="text-[#C0C0C0] text-xs">|</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        footer { font-family: 'Montserrat', sans-serif; }
        .vs-logo { font-family: 'Cormorant Garamond', serif; font-variant-caps: small-caps; }
      `}</style>
    </footer>
  );
}
