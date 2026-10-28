// Centralized shopping-platform configuration.
//
// Every place in the app that renders "buy on Shopee/Lazada/TikTok Shop"
// buttons should read from here instead of hard-coding platform names,
// colors, or search-URL formats per component (that duplication is what
// previously lived separately in cosmeticPage.jsx, AuramatchPage.jsx,
// MakeoverStudio.jsx and Analysis.jsx). Adding a new platform later means
// adding one entry here — no component needs to change.
//
// `key` must match the `platform` value the backend stores in the
// `product_platforms` table (services/product_platform_service.py).
export const SHOPPING_PLATFORMS = [
  {
    key: "shopee",
    label: "Shopee",
    isActive: true,
    // Tailwind classes for the platform's brand button styling.
    buttonClassName: "bg-[#EE4D2D] hover:bg-[#D94429] text-white",
    // Fallback: search the platform by product name when no real per-product
    // URL has been set by an admin yet — keeps today's behavior working.
    buildSearchUrl: (name) => `https://shopee.co.th/search?keyword=${encodeURIComponent(name || "")}`,
    allowedHosts: ["shopee.co.th", "shopee.com", "shp.ee"],
  },
  {
    key: "lazada",
    label: "Lazada",
    isActive: true,
    buttonClassName: "bg-[#0F0E8E] hover:bg-[#0D0C7A] text-white",
    buildSearchUrl: (name) => `https://www.lazada.co.th/catalog/?q=${encodeURIComponent(name || "")}`,
    allowedHosts: ["lazada.co.th", "lazada.com", "lzd.co"],
  },
  {
    key: "tiktok_shop",
    label: "TikTok Shop",
    isActive: true,
    buttonClassName: "bg-[#1A1A1A] hover:bg-black text-white",
    buildSearchUrl: (name) => `https://www.tiktok.com/search/video?q=${encodeURIComponent(name || "")}`,
    allowedHosts: ["tiktok.com", "shop.tiktok.com"],
  },
];

export function getActivePlatforms() {
  return SHOPPING_PLATFORMS.filter((p) => p.isActive);
}

export function getPlatformConfig(key) {
  const normalized = String(key || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return SHOPPING_PLATFORMS.find((p) => p.key === normalized);
}
