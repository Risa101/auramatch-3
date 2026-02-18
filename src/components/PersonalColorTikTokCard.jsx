import { Play, Sparkles } from "lucide-react";

export default function PersonalColorTikTokCard({ video, onSelect, delay = 0 }) {
  return (
    <div
      data-aos="zoom-in"
      data-aos-delay={delay}
      className="group relative aspect-[9/16] overflow-hidden bg-[#F9F9F9] cursor-pointer rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-[#D23669]/10 transition-all duration-500"
      onClick={() => onSelect(video)}
    >
      {/* 1. VIBRANT BACKGROUND (The Moving Canvas) */}
      <div className="absolute inset-0 w-full h-full group-hover:scale-110 transition-transform duration-[2s] ease-out">
        <img
          src={video.thumbnail || "/assets/home.PNG"}
          alt={video.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover brightness-110 contrast-[1.05]"
        />
        {/* Soft Pastel Overlay - เปลี่ยนจากสีดำเป็นสีชมพู/ม่วงโปร่งแสง */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#D23669]/60 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity duration-700" />
      </div>

      {/* 2. DAILY DOSE INTERFACE */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-8">
        
        {/* Top: Capsule Tag & Icon */}
        <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 transition-all duration-500">
          <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
            <Sparkles size={10} className="text-[#D23669]" />
            <span className="text-[8px] tracking-[0.2em] uppercase text-[#D23669] font-black italic">Daily Tip</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#D23669]">
            <Play size={12} fill="currentColor" />
          </div>
        </div>

        {/* Bottom: Playful Typography */}
        <div className="space-y-4">
          <div className="inline-block bg-[#FFD1DC] px-3 py-1 rounded-lg -rotate-2 group-hover:rotate-0 transition-transform duration-500">
            <span className="block text-[9px] font-black uppercase tracking-widest text-[#D23669]">
              {video.season || "Best Match"}
            </span>
          </div>
          
          <h4 className="text-xl md:text-2xl font-[900] text-white leading-tight tracking-tighter uppercase drop-shadow-md group-hover:scale-105 transition-transform origin-left duration-500">
            {video.title}
          </h4>

          {/* Action Bar */}
          <div className="flex items-center gap-2 pt-2 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
             <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white w-0 group-hover:w-full transition-all duration-[3s] ease-out" />
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest text-white">Watch Now</span>
          </div>
        </div>
      </div>

      {/* 3. BUBBLE DECORATION (Subtle Floating Particles) */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden opacity-40">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-float-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-[#FFD1DC] rounded-full animate-float-delayed" />
      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-15px, -10px); }
        }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}