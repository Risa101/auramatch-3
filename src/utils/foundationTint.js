/**
 * foundationTint.js
 *
 * Foundation is different from lips/eyes/blush/contour: it covers the whole
 * face, not one small region, and it needs to be a BASE layer — applied
 * before lips/eyeshadow/blush, not stacked on top of them. Those other
 * layers render through MakeupRenderer as a WebGL pass over the raw photo,
 * and that pass is fully opaque (no per-pixel transparency), so anything
 * meant to sit "underneath" it has to be baked into the photo texture itself
 * before it's handed to the renderer — hence a plain 2D pre-pass here rather
 * than another overlay canvas.
 */

import { FACE_OVAL, toStagePoints } from "./makeupGeometry";

/**
 * Returns a canvas with `color` soft-light-tinted into the face-oval region
 * only (clipped, so hair/background/neck stay untouched). Returns a plain
 * copy of the image when no color/opacity is set.
 */
export function applyFoundationTint(image, landmarks, color, opacity) {
  const w = image.naturalWidth;
  const h = image.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, w, h);
  if (!color || !opacity) return canvas;

  const ring = toStagePoints(landmarks, FACE_OVAL, w, h);
  ctx.save();
  ctx.beginPath();
  ring.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
  ctx.clip();
  ctx.globalCompositeOperation = "soft-light";
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  return canvas;
}
