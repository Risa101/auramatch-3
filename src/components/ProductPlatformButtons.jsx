import { resolvePlatformLinks } from "../utils/platformLinks.js";

/**
 * Renders one "buy on <platform>" button per active shopping platform for a
 * product. Reads platform names/colors/fallback-URL logic from
 * src/data/shoppingPlatforms.js and src/utils/platformLinks.js instead of
 * hard-coding them here, so a new platform (or a real per-product URL set by
 * an admin) shows up automatically without touching this component.
 *
 * AuraMatch does not have an official Shopee/Lazada/TikTok Shop cart
 * integration -- these are plain outbound links to the platform's product
 * (or search) page, opened safely in a new tab.
 *
 * Props:
 *  - product: the product object (expects `name`, optionally `platforms`)
 *  - className: wrapper classes (defaults to a vertical stack, matching the
 *    existing product-modal "Available at" sections)
 *  - buttonClassName: extra classes applied to every button, layered on top
 *    of each platform's brand color from the config
 */
export default function ProductPlatformButtons({ product, className = "space-y-2", buttonClassName = "" }) {
  const links = resolvePlatformLinks(product);
  if (!links.length) return null;

  return (
    <div className={className}>
      {links.map((link) => (
        <a
          key={link.key}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center w-full py-3 text-[10px] font-[600] uppercase tracking-[0.25em] transition-all ${link.buttonClassName} ${buttonClassName}`}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
