import { useEffect, useState } from "react";
import { Ticket, Sparkles, Copy, CheckCircle2, X } from "lucide-react";

const KEY = "auramatch:coupon";
const DISMISS_KEY = "auramatch:banner_dismissed"; // คีย์สำหรับจำว่าปิดไปแล้ว

export default function DiscountBanner() {
  const [coupon, setCoupon] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // เริ่มต้นเป็น false ก่อนเช็ค dismissal
  const [isExiting, setIsExiting] = useState(false);

  const readCoupon = () => {
    // 1. เช็คว่าเคยกดปิดไปหรือยังใน Session นี้
    const isDismissed = sessionStorage.getItem(DISMISS_KEY) === "true";
    if (isDismissed) {
      setIsVisible(false);
      return;
    }

    const logged = localStorage.getItem("auramatch:isLoggedIn") === "true";
    if (!logged) {
      setCoupon(null);
      setIsVisible(false);
      return;
    }

    try {
      const c = JSON.parse(localStorage.getItem(KEY) || "null");
      if (c && c.status === "active" && Date.now() <= c.validUntil) {
        setCoupon(c);
        setIsVisible(true);
      } else {
        setCoupon(null);
        setIsVisible(false);
      }
    } catch {
      setCoupon(null);
      setIsVisible(false);
    }
  };

  useEffect(() => {
    readCoupon();
    window.addEventListener("auth:changed", readCoupon);
    window.addEventListener("coupon:changed", readCoupon);
    window.addEventListener("storage", readCoupon);
    return () => {
      window.removeEventListener("auth:changed", readCoupon);
      window.removeEventListener("coupon:changed", readCoupon);
      window.removeEventListener("storage", readCoupon);
    };
  }, []);

  // ฟังก์ชันปิดที่แก้ไขให้ทำงานชัวร์ๆ
  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation(); // กัน event ไหลไปโดนตัว Banner
    
    setIsExiting(true);
    // บันทึกว่าปิดไปแล้ว
    sessionStorage.setItem(DISMISS_KEY, "true");
    
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  if (!coupon || !isVisible) return null;

  const copy = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      window.prompt("Your exclusive code:", coupon.code);
    }
  };

  return (
    <div className={`relative w-full px-6 md:px-10 mt-[100px] mb-8 z-[50] transition-all duration-300 ease-in-out ${
      isExiting ? "opacity-0 scale-95 translate-y-4" : "animate-victoria-slide"
    }`}>
      <div className="max-w-7xl mx-auto relative">
        
        {/* ✨ ปรับปรุงปุ่ม X: เพิ่ม z-index สูงสุดและ pointer-events-auto */}
        <button 
          onClick={handleClose}
          type="button"
          className="absolute -top-4 -right-4 z-[100] w-10 h-10 bg-black text-white rounded-full border-2 border-white flex items-center justify-center hover:bg-[#FF8E9E] hover:scale-110 transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer pointer-events-auto"
          style={{ touchAction: 'manipulation' }} // สำหรับมือถือ
        >
          <X size={20} />
        </button>

        <div className="group relative overflow-hidden rounded-[40px] border-2 border-black bg-white shadow-[8px_8px_0px_0px_#FF8E9E] transition-all duration-500 hover:shadow-none hover:translate-x-1 hover:translate-y-1">
          
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[#FFF0F2] -skew-x-12 translate-x-20 z-0 transition-transform group-hover:skew-x-0 group-hover:translate-x-0 duration-700"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-6 lg:p-8 gap-8">
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="hidden md:flex items-center justify-center w-20 h-20 bg-black rounded-[25px] rotate-12 group-hover:rotate-0 transition-transform duration-500">
                <Ticket className="text-[#FF8E9E] -rotate-12 group-hover:rotate-0 transition-transform duration-500" size={36} />
              </div>
              
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-[#FF8E9E] text-white px-3 py-1 rounded-full mb-3 shadow-[3px_3px_0px_0px_#000]">
                  <Sparkles size={10} />
                  <span className="text-[10px] font-black uppercase tracking-widest italic">Member Privilege</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-black italic leading-none mb-2">
                  Glam <span className="text-[#FF8E9E]">Welcome Gift</span>
                </h3>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter italic">
                   Unlock <span className="text-black">{coupon.discount}% OFF</span> for your perfect aura look.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="relative flex items-center bg-white border-2 border-black rounded-2xl px-6 py-4 w-full sm:w-auto overflow-hidden group/code">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-[#FF8E9E] tracking-widest">Voucher Code</span>
                    <span className="text-xl font-black tracking-[0.2em] text-black uppercase">{coupon.code}</span>
                </div>
                <div className="ml-8 w-[2px] h-10 bg-[#FFF0F2]"></div>
                <button 
                  onClick={copy} 
                  className="relative z-20 ml-6 p-3 rounded-xl bg-[#FFF0F2] text-[#FF8E9E] hover:bg-black hover:text-white transition-all duration-300 active:scale-95"
                  title="Copy Code"
                >
                  {copied ? <CheckCircle2 size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
              </div>

              <div className="px-6 py-2 border-2 border-dashed border-[#FF8E9E] rounded-2xl hidden xl:block">
                 <p className="text-[9px] font-black text-[#FF8E9E] uppercase leading-tight">Status: Active<br/>Exclusive for you</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes victoria-slide {
          from { opacity: 0; transform: translateY(-20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-victoria-slide { 
          animation: victoria-slide 1s cubic-bezier(0.19, 1, 0.22, 1) forwards; 
        }
      `}</style>
    </div>
  );
}