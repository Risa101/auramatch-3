/**
 * makeupGeometry.js
 *
 * Geometry + palettes for the makeup studio. Landmark index rings follow the
 * MediaPipe FaceMesh topology (FACEMESH_LIPS). Ported from auramatchgenz
 * (frontend/src/lib/makeup.ts).
 */

/** Outer lip contour, ordered (clockwise) so it closes into one ring. */
export const LIPS_OUTER = [
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146,
];

/** Inner lip contour (mouth opening) — punched out of the lipstick fill. */
export const LIPS_INNER = [
  78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95,
];

/** Mid-cheek anchor points (right / left in image space). */
export const CHEEK_RIGHT = 50;
export const CHEEK_LEFT = 280;

/** Upper-lid arcs, outer corner → inner corner (FACEMESH_*_EYE upper edge). */
export const EYE_UPPER_RIGHT = [33, 246, 161, 160, 159, 158, 157, 173, 133];
export const EYE_UPPER_LEFT = [263, 466, 388, 387, 386, 385, 384, 398, 362];

/** Brow lower edges, same outer → inner direction as the eye arcs above. */
export const BROW_LOWER_RIGHT = [46, 53, 52, 65, 55];
export const BROW_LOWER_LEFT = [276, 283, 282, 295, 285];

/** Face-oval extremes used to scale blush radius with face size. */
const FACE_RIGHT = 234;
const FACE_LEFT = 454;

/**
 * Full face-outline ring (MediaPipe's standard FACEMESH_FACE_OVAL point
 * sequence — one of the most widely reproduced landmark constants, used for
 * face isolation/background-removal filters everywhere). Used to clip the
 * foundation tint to skin, not hair/background.
 */
export const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152,
  148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
];

/** Normalized landmark → stage pixel coordinates. */
export function toStagePoints(landmarks, indices, width, height) {
  return indices.map((i) => ({ x: landmarks[i].x * width, y: landmarks[i].y * height }));
}

export function blushPlacements(landmarks, width, height) {
  const faceWidth = Math.hypot(
    (landmarks[FACE_LEFT].x - landmarks[FACE_RIGHT].x) * width,
    (landmarks[FACE_LEFT].y - landmarks[FACE_RIGHT].y) * height
  );
  const radius = faceWidth * 0.14;
  return [CHEEK_RIGHT, CHEEK_LEFT].map((i) => ({
    center: {
      x: landmarks[i].x * width,
      // nudged slightly down so the bloom sits on the cheekbone, not under-eye
      y: landmarks[i].y * height + faceWidth * 0.02,
    },
    radius,
  }));
}

/**
 * Contour (cheek hollow) shadow placements. Deliberately NOT a port — genz
 * never built contour — but reuses only anchor points genz's own code
 * already validates (CHEEK_RIGHT/LEFT, FACE_RIGHT/LEFT), offset further down
 * and slightly inward from the blush apex, into the hollow below the
 * cheekbone. No new/unverified landmark indices, just a different offset on
 * trusted ones — kept conservative since this hasn't been visually checked.
 */
export function contourPlacements(landmarks, width, height) {
  const faceWidth = Math.hypot(
    (landmarks[FACE_LEFT].x - landmarks[FACE_RIGHT].x) * width,
    (landmarks[FACE_LEFT].y - landmarks[FACE_RIGHT].y) * height
  );
  const radius = faceWidth * 0.13;
  return [
    { cheek: CHEEK_RIGHT, side: 1 },
    { cheek: CHEEK_LEFT, side: -1 },
  ].map(({ cheek, side }) => ({
    center: {
      // further down than blush (hollow, not the apple of the cheek) and
      // nudged slightly toward center-face (side flips sign per cheek)
      x: landmarks[cheek].x * width + side * faceWidth * -0.03,
      y: landmarks[cheek].y * height + faceWidth * 0.1,
    },
    radius,
  }));
}

/** Nose tip — the single most consistently-cited index across MediaPipe FaceMesh AR references. */
const NOSE_TIP = 4;

/**
 * Nose-side contour shadow placements. Bridge-top reference is the midpoint
 * of the eyes' inner corners (133/362 — genz's own EYE_UPPER_RIGHT/LEFT
 * endpoints, already trusted), interpolated down to the nose tip (4) and
 * offset sideways by a fraction of face width — plain vector math on a
 * couple of high-confidence points, rather than guessing at less-certain
 * "nose ala" index names. Small soft blobs (not a hard-edged polygon) so a
 * minor offset error stays a subtle shadow, not a visibly broken shape.
 */
export function noseContourPlacements(landmarks, width, height) {
  const faceWidth = Math.hypot(
    (landmarks[FACE_LEFT].x - landmarks[FACE_RIGHT].x) * width,
    (landmarks[FACE_LEFT].y - landmarks[FACE_RIGHT].y) * height
  );
  const bridgeTop = {
    x: ((landmarks[133].x + landmarks[362].x) / 2) * width,
    y: ((landmarks[133].y + landmarks[362].y) / 2) * height,
  };
  const tip = { x: landmarks[NOSE_TIP].x * width, y: landmarks[NOSE_TIP].y * height };
  const lerp = (t) => ({ x: bridgeTop.x + (tip.x - bridgeTop.x) * t, y: bridgeTop.y + (tip.y - bridgeTop.y) * t });
  const sideOffset = faceWidth * 0.045;
  const radius = faceWidth * 0.045;
  const placements = [];
  for (const t of [0.4, 0.7]) {
    const p = lerp(t);
    for (const side of [1, -1]) {
      placements.push({ center: { x: p.x + side * sideOffset, y: p.y }, radius });
    }
  }
  return placements;
}

/**
 * Eyeshadow bands: for each upper-lid point, lerp toward the brow's lower edge
 * (interpolated at the same arc fraction, so the band follows head tilt). The
 * bottom ring sits 8% above the lash line so the shader's edge feather can't
 * bleed onto the eyeball; the top ring stops at 62% so shadow never touches
 * the brow itself.
 */
export function eyeshadowRegions(landmarks, width, height) {
  const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  return [
    [EYE_UPPER_RIGHT, BROW_LOWER_RIGHT],
    [EYE_UPPER_LEFT, BROW_LOWER_LEFT],
  ].map(([eyeIdx, browIdx]) => {
    const eye = toStagePoints(landmarks, eyeIdx, width, height);
    const brow = toStagePoints(landmarks, browIdx, width, height);
    const browAt = (f) => {
      const t = f * (brow.length - 1);
      const i = Math.min(brow.length - 2, Math.floor(t));
      return lerp(brow[i], brow[i + 1], t - i);
    };
    const toward = (t) => eye.map((p, i) => lerp(p, browAt(i / (eye.length - 1)), t));
    return { lower: toward(0.08), upper: toward(0.62) };
  });
}

/**
 * Season-matched shade palettes (warm/cool consistent with the Korean system:
 * spring/autumn warm, summer/winter cool). Display suggestions only.
 */
export const LIP_PALETTES = {
  spring: ["#ff7f6b", "#f2695c", "#e8636f", "#d96c2f"],
  summer: ["#c4698f", "#b75d7e", "#a24e6b", "#e38aa0"],
  autumn: ["#a84b32", "#b85c38", "#8a3a2b", "#c1663b"],
  winter: ["#c21e56", "#b3266e", "#8e1e3f", "#d42a4c"],
};

export const BLUSH_PALETTES = {
  spring: ["#ffa38f", "#ff8f80", "#f7a072", "#ef9d87"],
  summer: ["#e79fb8", "#d98ca6", "#c98397", "#eeb2c5"],
  autumn: ["#cd7f5d", "#c47653", "#b96f57", "#d98e64"],
  winter: ["#e0608a", "#d4557f", "#c04a70", "#e87a9b"],
};

export const EYESHADOW_PALETTES = {
  spring: ["#e8a87c", "#dd9469", "#c98a5e", "#f0b490"],
  summer: ["#c79bb0", "#b58aa0", "#a58398", "#d4afc4"],
  autumn: ["#b0714f", "#9c6a4a", "#8a5a3e", "#c08260"],
  winter: ["#9c6b8f", "#7d5a7d", "#6b5b73", "#b07aa0"],
};
