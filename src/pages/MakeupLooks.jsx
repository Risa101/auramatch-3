import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toggleLike, isLiked } from "../utils/likes";
import AOS from "aos";
import "aos/dist/aos.css";

const BASE_PATH = import.meta.env.BASE_URL;

export default function MakeupLooks() {
  const [season, setSeason] = useState("Spring");
  const [query, setQuery] = useState("");
  const [looks, setLooks] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [likedTrigger, setLikedTrigger] = useState(0);

  useEffect(() => {
    AOS.init({
  duration: 800,
  easing: "ease-out-quart",
  once: false,
});

  }, []);

  useEffect(() => {
  const fetchLooks = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/looks`,
        {
          params: { personal_color: season },
        }
      );

      if (res.data?.status === "success") {
        setLooks(res.data.data || []);
      } else {
        setLooks([]);
      }

      // refresh AOS หลัง render
      setTimeout(() => AOS.refresh(), 100);

    } catch (err) {
      console.error("Fetch looks error:", err);
      setLooks([]);
    } finally {
      setLoading(false);
    }
  };

  if (season) fetchLooks();
}, [season]);


  const filteredLooks = useMemo(() => 
    looks.filter(look => look.look_name.toLowerCase().includes(query.toLowerCase())), [looks, query]
  );

  const getFullImagePath = (path) => {
  if (!path) return `${BASE_PATH}assets/default-product.png`;
  if (path.startsWith("http")) return path;

  const clean = path.startsWith("/") ? path.slice(1) : path;
  return `${BASE_PATH}${clean}`;
};


  // ฟังก์ชันกด Like
  const handleToggleLike = (e, look) => {
    e.stopPropagation(); // กันไม่ให้ไปเปิด Modal ตอนกดหัวใจ
    toggleLike({
      id: look.look_id,
      title: look.look_name,
      img: look.image_url,
      season: look.personal_color
    });
    setLikedTrigger(v => v + 1); // Trigger ให้ Component Re-render เพื่ออัปเดตสีหัวใจ
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] pb-40 pt-32 px-10">
      
      {/* Title */}
      <header className="text-center mb-24" data-aos="fade-up">
        <span className="text-[10px] tracking-[0.8em] font-black uppercase text-[#C5A358] block mb-6">Discovery</span>
        <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter">Aesthetics.</h1>
      </header>

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[#FDFCFB]/60 backdrop-blur-lg border-b border-gray-100 mb-20">
        <div className="max-w-6xl mx-auto py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-12">
            {["Spring", "Summer", "Autumn", "Winter"].map((s) => (
              <button
                key={s}
                onClick={() => setSeason(s)}
                className={`text-[10px] tracking-[0.4em] uppercase font-bold transition-all relative pb-2 ${
                  season === s ? "text-[#C5A358]" : "text-gray-300 hover:text-black"
                }`}
              >
                {s}
                {season === s && <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A358]" />}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH COLLECTION"
            className="bg-transparent border-b border-gray-100 py-1 text-[10px] tracking-[0.2em] focus:outline-none focus:border-[#C5A358] w-full md:w-48 placeholder:text-gray-200"
          />
        </div>
      </nav>

      {/* Grid */}
      <main className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-40 font-serif italic text-gray-300 tracking-widest uppercase text-xs">Curating...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {filteredLooks.map((look, index) => (
              <div 
                key={look.look_id} 
                className="group cursor-pointer relative" 
                onClick={() => setSelected(look)}
                data-aos="fade-up"
                data-aos-delay={index % 3 * 100}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF9F8] mb-8">
                  {/* ปุ่มหัวใจ (Back & Functional) */}
                  <button 
                    onClick={(e) => handleToggleLike(e, look)}
                    className="absolute top-6 right-6 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 transition-all duration-300 hover:scale-110 active:scale-90 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <svg 
                      className={`w-5 h-5 transition-colors ${isLiked(look.look_id) ? "text-red-500 fill-current" : "text-white"}`} 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  <img
                    src={getFullImagePath(look.image_url)} 
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                    alt={look.look_name}
                  />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-lg font-serif italic">{look.look_name}</h3>
                  <p className="text-[9px] tracking-[0.3em] text-gray-300 uppercase font-bold">{look.personal_color}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-white/95 backdrop-blur-md" onClick={() => setSelected(null)}>
          <div className="max-w-6xl w-full flex flex-col md:flex-row gap-20 items-center" onClick={e => e.stopPropagation()}>
            <div className="w-full md:w-1/2 aspect-[3/4] overflow-hidden shadow-2xl">
               <img src={getFullImagePath(selected.image_url)} className="w-full h-full object-cover" alt={selected.look_name} />
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <span className="text-[10px] tracking-[0.5em] font-black text-[#C5A358] uppercase mb-8 block">Selected Aesthetic</span>
              <h2 className="text-6xl md:text-7xl font-serif italic mb-8 leading-none">{selected.look_name}</h2>
              <p className="text-sm text-gray-400 font-light leading-relaxed mb-12 max-w-sm mx-auto md:mx-0">
                A masterpiece curation for the {selected.personal_color} palette. Tailored to enhance your natural aura.
              </p>
              <button className="text-[10px] tracking-[0.5em] font-black uppercase border-b border-black pb-2 hover:text-[#C5A358] hover:border-[#C5A358] transition-all">
                View Routine
              </button>
            </div>
          </div>
          <button className="absolute top-12 right-12 text-2xl font-light hover:rotate-90 transition-transform" onClick={() => setSelected(null)}>✕</button>
        </div>
      )}
    </div>
  );
}