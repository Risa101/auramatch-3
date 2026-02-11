import { X, Heart, Share2, Sparkles } from "lucide-react";

export default function TikTokModal({ video, onClose }) {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 overflow-hidden">
      {/* 1. Backdrop - เปลี่ยนเป็นสีม่วงพาสเทลจางๆ พร้อม Blur */}
      <div
        className="absolute inset-0 bg-[#E8D9F2]/60 backdrop-blur-md transition-opacity duration-700"
        onClick={onClose}
      />

      {/* 2. Floating Decorative Blobs */}
      <div className="absolute top-[10%] right-[20%] w-64 h-64 bg-[#FFD1DC] rounded-full blur-[100px] opacity-40 animate-pulse" />
      <div className="absolute bottom-[10%] left-[20%] w-64 h-64 bg-white rounded-full blur-[100px] opacity-40" />

      <div
        key={video.embedUrl}
        className="relative w-full max-w-[380px] aspect-[9/16]
                   bg-white rounded-[3rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(210,54,105,0.15)]
                   animate-modal-pop border-[8px] border-white"
      >
        {/* 3. Close Button (เปลี่ยนมาไว้ในกรอบให้ดูเหมือนแอป) */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-[160] w-10 h-10 bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-[#D23669] rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
        >
          <X size={20} strokeWidth={3} />
        </button>

        {/* 4. Top Tag: Category */}
        <div className="absolute top-8 left-8 z-20 pointer-events-none">
          <div className="bg-[#D23669] text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-[#D23669]/20">
             <Sparkles size={12} fill="white" />
             <span className="text-[10px] font-black tracking-widest uppercase italic">Aura Tip</span>
          </div>
        </div>

        {/* 5. Video Content */}
        <div className="w-full h-full bg-[#F9F9F9]">
          <iframe
            src={`${video.embedUrl}?autoplay=1&controls=0`}
            className="w-full h-full border-none"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            title={video.title}
          />
        </div>

        {/* 6. Information Overlay (Pink Gradient) */}
        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-[#D23669]/90 via-[#D23669]/20 to-transparent z-10">
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-widest text-white/80 uppercase bg-white/20 px-3 py-1 rounded-md backdrop-blur-sm">
                        {video.season || "Exclusive"}
                    </span>
                </div>
                
                <div className="flex justify-between items-end gap-4">
                    <h4 className="text-2xl font-[900] text-white leading-tight tracking-tighter uppercase">
                        {video.title}
                    </h4>
                    <div className="flex flex-col gap-3">
                      <button className="bg-white text-[#D23669] p-3 rounded-full shadow-lg hover:scale-110 transition-transform">
                          <Heart size={18} fill="#D23669" />
                      </button>
                      <button className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white hover:text-[#D23669] transition-all">
                          <Share2 size={18} />
                      </button>
                    </div>
                </div>

                {/* Progress Bar (Pink/White) */}
                <div className="pt-2">
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white w-1/2 animate-progress-daily"></div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <style>{`
        @keyframes modal-pop {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes progress-daily {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-modal-pop {
          animation: modal-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-progress-daily {
          animation: progress-daily 5s linear infinite;
        }
      `}</style>
    </div>
  );
}