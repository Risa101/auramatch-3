import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Instagram, Twitter, Youtube, Send } from "lucide-react";

export default function FooterDailyDose() {
  const { t } = useTranslation();

  return (
    <footer className="bg-white font-sans overflow-hidden">
      
      {/* 1. NEWSLETTER: FUN & BRIGHT */}
      <div className="bg-[#FFEBF0] py-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <h3 className="text-4xl md:text-6xl font-[900] text-[#D23669] tracking-tighter leading-none uppercase">
            We send really <br/> cool emails.
          </h3>
          <p className="text-xs md:text-sm text-gray-400 uppercase tracking-widest font-bold">
            Be the first to know about new products and flavours by signing up here:
          </p>
          
          <div className="max-w-lg mx-auto flex flex-col sm:flex-row gap-3 mt-10">
            <input 
              type="email" 
              placeholder="ENTER YOUR EMAIL" 
              className="flex-1 bg-white rounded-full px-8 py-5 text-xs font-bold tracking-widest outline-none focus:ring-4 ring-[#D23669]/10 transition-all text-gray-600"
            />
            <button className="bg-[#4A4A4A] text-white px-10 py-5 rounded-full text-xs font-[900] uppercase tracking-widest hover:bg-black transition-colors shadow-lg shadow-black/5 flex items-center justify-center gap-2">
              Sign Up <Send size={14} />
            </button>
          </div>
        </div>

        {/* Decorative Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-[#FFD1DC] rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#E8D9F2] rounded-full blur-3xl opacity-50" />
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="max-w-[1400px] mx-auto px-10 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 md:gap-24">
          
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-10">
            <Link to="/" className="inline-block group">
              <h2 className="text-3xl font-[900] tracking-tighter text-[#D23669] leading-[0.8]">
                daily<br/>
                <span className="font-light italic text-[#FF85A2] text-2xl">dose</span>
              </h2>
            </Link>
            <p className="text-[11px] font-bold leading-loose text-gray-400 tracking-widest uppercase max-w-[280px]">
              Better health doesn't have to be boring. Your daily dose of joy and wellness, delivered.
            </p>
            <div className="flex gap-4">
               <SocialCircle icon={<Instagram size={20} />} href="#" />
               <SocialCircle icon={<Twitter size={20} />} href="#" />
               <SocialCircle icon={<Youtube size={20} />} href="#" />
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
            <FooterLinkGroup 
              title="Shop" 
              links={[
                { name: "All Products", to: "/cosmetics" },
                { name: "Bundles", to: "/looks" },
                { name: "Subscriptions", to: "/analysis" },
                { name: "Gift Cards", to: "/coupons" }
              ]} 
            />
            <FooterLinkGroup 
              title="Learn" 
              links={[
                { name: "Our Story", to: "/about" },
                { name: "Sustainability", to: "/heritage" },
                { name: "Journal", to: "/history" }
              ]} 
            />
            <FooterLinkGroup 
              title="Support" 
              links={[
                { name: "Contact Us", to: "/faq" },
                { name: "Wholesale", to: "/locations" },
                { name: "Terms & Privacy", to: "/privacy" }
              ]} 
            />
          </div>

        </div>

        {/* 3. FINAL BAR: ACCESSIBILITY & COPYRIGHT */}
        <div className="mt-24 pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-8 order-2 md:order-1">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D23669] bg-[#FFEBF0] px-4 py-1.5 rounded-full">Cruelty Free</span>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D23669] bg-[#E8D9F2] px-4 py-1.5 rounded-full">Vegan</span>
          </div>
          
          <div className="text-center md:text-right space-y-2 order-1 md:order-2">
             <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
               © {new Date().getFullYear()} Daily Dose Int. Powered by AuraMatch.
             </p>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');
        footer { font-family: 'Montserrat', sans-serif; }
      `}</style>
    </footer>
  );
}

function FooterLinkGroup({ title, links }) {
  return (
    <div className="space-y-8">
      <h4 className="text-[12px] font-[900] tracking-widest text-[#4A4A4A] uppercase">{title}</h4>
      <ul className="flex flex-col gap-4">
        {links.map((link) => (
          <li key={link.name}>
            <Link 
              to={link.to} 
              className="text-[11px] text-gray-400 font-bold hover:text-[#D23669] tracking-widest uppercase transition-colors"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialCircle({ icon, href }) {
  return (
    <a 
      href={href} 
      className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#D23669] hover:text-white hover:border-[#D23669] transition-all duration-300"
    >
      {icon}
    </a>
  );
}