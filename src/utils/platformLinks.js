// Pure helpers for resolving a product's "buy on ___" links across multiple
// shopping platforms. No React/DOM here so this is trivially unit-testable
// (see platformLinks.test.js) and reusable from any component or page.
import { getActivePlatforms, getPlatformConfig } from "../data/shoppingPlatforms.js";

/** Only ever hand out http(s) URLs to a real anchor tag -- rejects
 * javascript:/data:/mailto: etc, and rejects unparsable strings outright. */
export function isSafeUrl(raw) {
  if (!raw || typeof raw !== "string") return false;
  try {
    const url = new URL(raw.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Build the ordered list of "buy on <platform>" links for a product.
 *
 * `product.platforms` (when present) is the real, admin-set data from the
 * backend's `product_platforms` table: [{ platform, product_url,
 * affiliate_url, is_active }, ...]. For any active platform without a real
 * URL, we fall back to a generated search-by-name link on that platform --
 * this preserves the app's pre-existing behavior (every product always had
 * *some* Shopee/Lazada/TikTok link, just not a specific one) instead of
 * silently hiding the button.
 *
 * Returns: [{ key, label, url, buttonClassName, isReal }, ...]
 */
export function resolvePlatformLinks(product) {
  if (!product) return [];

  const realByKey = new Map();
  if (Array.isArray(product.platforms)) {
    for (const entry of product.platforms) {
      if (!entry || entry.is_active === false) continue;
      const config = getPlatformConfig(entry.platform);
      if (!config) continue; // unknown platform key -- ignore rather than guess styling
      const url = entry.affiliate_url && isSafeUrl(entry.affiliate_url)
        ? entry.affiliate_url
        : entry.product_url;
      if (isSafeUrl(url)) {
        realByKey.set(config.key, url);
      }
    }
  }

  const name = product.name || "";
  return getActivePlatforms().map((config) => {
    const realUrl = realByKey.get(config.key);
    const url = realUrl || config.buildSearchUrl(name);
    return {
      key: config.key,
      label: config.label,
      url,
      buttonClassName: config.buttonClassName,
      isReal: Boolean(realUrl),
    };
  });
}

/**
 * A single "best" link for compact surfaces (e.g. a grid tile that's one big
 * clickable card, like the AI recommendation results in Analysis.jsx) where
 * showing three separate buttons would break the layout.
 *
 * Preference order: a real per-platform URL > the legacy single `shop_url`
 * field (`products.links` in the DB) > a generated search link.
 */
export function resolvePrimaryLink(product) {
  if (!product) return null;
  const links = resolvePlatformLinks(product);
  const real = links.find((l) => l.isReal);
  if (real) return real.url;
  if (isSafeUrl(product.shop_url)) return product.shop_url;
  return links[0]?.url || null;
}
