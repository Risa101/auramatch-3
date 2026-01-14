// src/components/MakeoverStudio.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./MakeoverStudio.css";

/* 💡 แนะนำ: นำรูปภาพไปวางใน public/assets/makeover/ 
  และเปลี่ยน path ด้านล่างให้ตรงกับชื่อไฟล์จริงของคุณ
*/

const BROWS = [
  { key: "none", labelKey: "makeover.brows.none", img: "" },
  { key: "soft", labelKey: "makeover.brows.softArch", img: "/assets/makeover/brow-soft.png" },
  { key: "straight", labelKey: "makeover.brows.straight", img: "/assets/makeover/brow-straight.png" },
];

const LIPS = [
  { key: "none", labelKey: "makeover.lips.none", img: "" },
  { key: "red", labelKey: "makeover.lips.red", img: "/assets/makeover/lip-red.png" },
  { key: "pink", labelKey: "makeover.lips.pink", img: "/assets/makeover/lip-pink.png" },
  { key: "nude", labelKey: "makeover.lips.nude", img: "/assets/makeover/lip-nude.png" },
];

// ... (หมวดหมู่อื่นๆ แก้ไข path ในลักษณะเดียวกัน)

export default function MakeoverStudio({ base = "/assets/analysis.JPG" }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("Lips");
  const [selections, setSelections] = useState({
    Brows: BROWS[0],
    Lips: LIPS[0],
    // ...
  });

  return (
    <div className="makeover-container bg-white shadow-2xl overflow-hidden rounded-sm border border-gray-100">
      <div className="grid lg:grid-cols-12 min-h-[650px]">
        
        {/* --- LEFT: MIRROR PREVIEW --- */}
        <div className="lg:col-span-7 bg-[#F2F2F2] relative flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* รูปพื้นฐาน (หน้าผู้ใช้) */}
            <img 
              src={base} 
              className="absolute inset-0 w-full h-full object-cover" 
              alt="Base"
              onError={(e) => e.target.src = "https://via.placeholder.com/800x1000?text=Please+Upload+Photo"} 
            />
            
            {/* Layers: ต้องใช้ absolute ทับกัน และตั้งค่า Pointer Events เป็น none */}
            {Object.values(selections).map((item, idx) => (
              item.img && (
                <img 
                  key={idx}
                  src={item.img} 
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none animate-in fade-in duration-500"
                  style={{ mixBlendMode: "multiply", opacity: 0.85 }}
                  alt="Overlay"
                />
              )
            ))}
          </div>
          
          <div className="absolute top-8 left-8">
            <h2 className="text-[12px] font-bold tracking-[0.5em] uppercase text-[#2D2424] bg-white/80 px-4 py-2">
              Aura-AR Live
            </h2>
          </div>
        </div>

        {/* --- RIGHT: CONTROL PANEL (Dior Style) --- */}
        <div className="lg:col-span-5 flex flex-col bg-white border-l border-gray-100">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
            {["Brows", "Lips", "Hairstyle"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-6 text-[10px] font-bold tracking-[0.3em] uppercase transition-all ${
                  activeTab === tab ? "text-[#C5A358] border-b border-[#C5A358]" : "text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Options Grid */}
          <div className="flex-1 p-10 overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-2 gap-6">
              {(activeTab === "Lips" ? LIPS : BROWS).map((item) => (
                <div 
                  key={item.key}
                  onClick={() => setSelections({...selections, [activeTab]: item})}
                  className={`cursor-pointer transition-all ${selections[activeTab].key === item.key ? "opacity-100" : "opacity-40 hover:opacity-100"}`}
                >
                  <div className="aspect-[3/2] bg-gray-50 mb-3 overflow-hidden border border-gray-100 flex items-center justify-center p-4">
                    {item.img ? (
                      <img src={item.img} className="max-h-full object-contain" alt={item.key} />
                    ) : (
                      <span className="text-[10px] tracking-widest text-gray-400">NONE</span>
                    )}
                  </div>
                  <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-center text-[#2D2424]">
                    {item.key}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-8 bg-gray-50/50 grid grid-cols-2 gap-4">
            <button className="py-4 border border-[#2D2424] text-[9px] font-bold tracking-[0.3em] uppercase hover:bg-[#2D2424] hover:text-white transition-all">
              Reset Look
            </button>
            <button className="py-4 bg-[#2D2424] text-white text-[9px] font-bold tracking-[0.3em] uppercase hover:bg-[#C5A358] transition-all">
              Save Result
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}