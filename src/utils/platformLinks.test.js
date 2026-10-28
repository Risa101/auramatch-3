// Pure-function tests for platformLinks.js -- no React/DOM involved, runs
// under Node's built-in test runner (`npm test`), same convention as
// faceGeometry.test.js.
import test from "node:test";
import assert from "node:assert/strict";
import { isSafeUrl, resolvePlatformLinks, resolvePrimaryLink } from "./platformLinks.js";

test("isSafeUrl accepts http/https, rejects everything else", () => {
  assert.equal(isSafeUrl("https://shopee.co.th/x"), true);
  assert.equal(isSafeUrl("http://lazada.co.th/x"), true);
  assert.equal(isSafeUrl("javascript:alert(1)"), false);
  assert.equal(isSafeUrl("data:text/html,<script>"), false);
  assert.equal(isSafeUrl(""), false);
  assert.equal(isSafeUrl(null), false);
  assert.equal(isSafeUrl("not a url"), false);
});

test("resolvePlatformLinks falls back to a generated search URL when no real platforms exist", () => {
  const product = { name: "Rare Beauty Soft Pinch" };
  const links = resolvePlatformLinks(product);
  assert.equal(links.length, 3); // shopee, lazada, tiktok_shop
  for (const link of links) {
    assert.equal(link.isReal, false);
    assert.match(link.url, /Rare%20Beauty%20Soft%20Pinch|Rare\+Beauty\+Soft\+Pinch/);
  }
});

test("resolvePlatformLinks prefers a real per-platform URL over the generated fallback", () => {
  const product = {
    name: "Rare Beauty Soft Pinch",
    platforms: [
      { platform: "shopee", product_url: "https://shopee.co.th/real-product-123", is_active: true },
    ],
  };
  const links = resolvePlatformLinks(product);
  const shopee = links.find((l) => l.key === "shopee");
  const lazada = links.find((l) => l.key === "lazada");
  assert.equal(shopee.isReal, true);
  assert.equal(shopee.url, "https://shopee.co.th/real-product-123");
  assert.equal(lazada.isReal, false); // no real lazada link -> still falls back
});

test("resolvePlatformLinks ignores inactive platform rows", () => {
  const product = {
    name: "X",
    platforms: [
      { platform: "shopee", product_url: "https://shopee.co.th/real", is_active: false },
    ],
  };
  const links = resolvePlatformLinks(product);
  const shopee = links.find((l) => l.key === "shopee");
  assert.equal(shopee.isReal, false); // inactive -> treated as absent, falls back
});

test("resolvePlatformLinks rejects an unsafe stored URL and falls back instead", () => {
  const product = {
    name: "X",
    platforms: [
      { platform: "shopee", product_url: "javascript:alert(1)", is_active: true },
    ],
  };
  const links = resolvePlatformLinks(product);
  const shopee = links.find((l) => l.key === "shopee");
  assert.equal(shopee.isReal, false);
  assert.equal(isSafeUrl(shopee.url), true);
});

test("resolvePlatformLinks prefers affiliate_url over product_url when both are present", () => {
  const product = {
    name: "X",
    platforms: [
      {
        platform: "lazada",
        product_url: "https://lazada.co.th/plain",
        affiliate_url: "https://lazada.co.th/aff?ref=123",
        is_active: true,
      },
    ],
  };
  const links = resolvePlatformLinks(product);
  const lazada = links.find((l) => l.key === "lazada");
  assert.equal(lazada.url, "https://lazada.co.th/aff?ref=123");
});

test("resolvePrimaryLink prefers a real platform link, then legacy shop_url, then a generated fallback", () => {
  assert.equal(
    resolvePrimaryLink({ name: "X", platforms: [{ platform: "shopee", product_url: "https://shopee.co.th/real", is_active: true }] }),
    "https://shopee.co.th/real"
  );
  assert.equal(
    resolvePrimaryLink({ name: "X", shop_url: "https://www.tiktok.com/legacy-link" }),
    "https://www.tiktok.com/legacy-link"
  );
  assert.match(resolvePrimaryLink({ name: "X" }), /^https:\/\//);
});

test("resolvePrimaryLink returns null for a falsy product", () => {
  assert.equal(resolvePrimaryLink(null), null);
});
