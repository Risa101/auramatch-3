const isLocalhost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const API_ORIGIN = isLocalhost
  ? ""
  : (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

/**
 * Prepend the backend origin to a relative image path.
 * In development, Vite proxy forwards these paths to the backend automatically.
 * In production, the full backend URL is prepended.
 *
 * @param {string} path - e.g. "/assets/foo.jpg" or "/faceshape/oval.jpg"
 * @param {string} [fallback="/assets/home2.webp"]
 */
export function imgUrl(path, fallback = "/assets/home2.webp") {
  const p = path || fallback;
  if (!p) return "";
  // Already an absolute URL (http/https) or data: URI — return as-is
  if (/^(https?:\/\/|data:)/.test(p)) return p;
  const clean = p.startsWith("/") ? p : `/${p}`;
  return `${API_ORIGIN}${clean}`;
}
