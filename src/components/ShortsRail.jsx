import React, { useEffect, useRef, useState } from "react";
import { getYoutubeVideos } from "../callapi/call_api_youtube";

/* ===== Skeleton Card ===== */
function VideoSkeleton() {
  return (
    <div className="min-w-[240px] max-w-[240px] shrink-0 rounded-2xl border bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-[9/16] bg-gray-200" />
    </div>
  );
}

/* ===== Shorts Rail (YouTube from DB) ===== */
export default function ShortsRail() {
  const railRef = useRef(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== Fetch videos ===== */
  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const res = await getYoutubeVideos();

        if (!mounted) return;

        // รองรับทั้ง backend ส่ง array ตรง / { data: [] }
        const data = Array.isArray(res) ? res : res?.data ?? [];
        setVideos(data);
      } catch (err) {
        console.error("โหลด Makeup Tutorial ไม่สำเร็จ", err);
        setVideos([]);
      } finally {
        mounted && setLoading(false);
      }
    }

    fetchData();
    return () => (mounted = false);
  }, []);

  /* ===== Scroll helper ===== */
  const scrollBy = (dx) =>
    railRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  /* ===== Convert YouTube URL → embed ===== */
  const toEmbedUrl = (url = "") => {
    if (!url) return "";

    if (url.includes("watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }

    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1];
      return `https://www.youtube.com/embed/${id}`;
    }

    if (url.includes("shorts/")) {
      const id = url.split("shorts/")[1];
      return `https://www.youtube.com/embed/${id}`;
    }

    return url;
  };

  /* ===== Empty state ===== */
  if (!loading && videos.length === 0) {
    return (
      <div className="text-center text-sm text-[#75464A]/60 py-6">
        ยังไม่มี Makeup Tutorial
      </div>
    );
  }

  return (
    <div className="relative">
      {/* ◀ Scroll Left */}
      <button
        onClick={() => scrollBy(-320)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full border bg-white/90 px-3 py-2 shadow-sm hover:scale-105 transition"
        aria-label="Scroll left"
      >
        ‹
      </button>

      {/* ▶ Scroll Right */}
      <button
        onClick={() => scrollBy(320)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full border bg-white/90 px-3 py-2 shadow-sm hover:scale-105 transition"
        aria-label="Scroll right"
      >
        ›
      </button>

      {/* Rail */}
      <div
        ref={railRef}
        className="flex gap-4 overflow-x-auto scroll-smooth px-10 py-2"
        style={{ scrollbarWidth: "none" }}
      >
        {/* ===== Loading skeleton ===== */}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <VideoSkeleton key={`skeleton-${i}`} />
          ))}

        {/* ===== Videos ===== */}
        {!loading &&
          videos.map((v, i) => (
            <div
              key={v.youtube_id ?? i}
              className="min-w-[240px] max-w-[240px] shrink-0 rounded-2xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <div className="aspect-[9/16] w-full">
                <iframe
                  src={toEmbedUrl(v.video_url)}
                  title={v.title ?? `Makeup Tutorial ${i + 1}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
