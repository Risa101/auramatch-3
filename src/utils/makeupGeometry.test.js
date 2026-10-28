// Pure-function tests for makeupGeometry.js's roll-corrected offset
// placements (blush/contour/nose-contour) -- no React/DOM/browser APIs
// involved, so these run under Node's built-in test runner (`npm test`).
// Mirrors the pattern in faceGeometry.test.js's "invariant to head roll"
// test, but checks EQUIVARIANCE instead: a placement built from an offset
// (not traced directly from landmarks) should rotate WITH the face, not
// stay glued to the image's x/y axes.

import test from "node:test";
import assert from "node:assert/strict";
import { blushPlacements, contourPlacements, noseContourPlacements } from "./makeupGeometry.js";

const SIZE = 1000; // square canvas -> normalized-space rotation == pixel-space rotation

/** Build a full 478-point normalized landmark array with only the indices
 * these placement functions actually read set to meaningful coordinates.
 */
function makeLandmarks({
  eyeR = [0.35, 0.4], eyeL = [0.65, 0.4], // 33 / 263 (right/left are mirrored in image space)
  faceR = [0.3, 0.5], faceL = [0.7, 0.5], // 234 / 454
  cheekR = [0.4, 0.55], cheekL = [0.6, 0.55], // 50 / 280
  innerR = [0.45, 0.45], innerL = [0.55, 0.45], // 133 / 362 (eye inner corners)
  noseTip = [0.5, 0.6], // 4
} = {}) {
  const lm = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  const set = (idx, [x, y]) => { lm[idx] = { x, y, z: 0 }; };
  set(33, eyeR); set(263, eyeL);
  set(234, faceR); set(454, faceL);
  set(50, cheekR); set(280, cheekL);
  set(133, innerR); set(362, innerL);
  set(4, noseTip);
  return lm;
}

function rotatePoint([x, y], angleDeg, cx = 0.5, cy = 0.5) {
  const a = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(a), sin = Math.sin(a);
  const dx = x - cx, dy = y - cy;
  return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
}

function rotatePx(p, angleDeg, cx, cy) {
  const [x, y] = rotatePoint([p.x / SIZE, p.y / SIZE], angleDeg, cx / SIZE, cy / SIZE);
  return { x: x * SIZE, y: y * SIZE };
}

function assertClose(a, b, msg, eps = 1e-6) {
  assert.ok(Math.abs(a.x - b.x) < eps && Math.abs(a.y - b.y) < eps, `${msg}: got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`);
}

for (const [name, fn] of [
  ["blushPlacements", blushPlacements],
  ["contourPlacements", contourPlacements],
  ["noseContourPlacements", noseContourPlacements],
]) {
  test(`${name}: rotating the whole face rotates the placement (roll-equivariant, not axis-locked)`, () => {
    const base = makeLandmarks();
    const basePlacements = fn(base, SIZE, SIZE);

    for (const angle of [15, -20, 40]) {
      const tilted = makeLandmarks({
        eyeR: rotatePoint([0.35, 0.4], angle), eyeL: rotatePoint([0.65, 0.4], angle),
        faceR: rotatePoint([0.3, 0.5], angle), faceL: rotatePoint([0.7, 0.5], angle),
        cheekR: rotatePoint([0.4, 0.55], angle), cheekL: rotatePoint([0.6, 0.55], angle),
        innerR: rotatePoint([0.45, 0.45], angle), innerL: rotatePoint([0.55, 0.45], angle),
        noseTip: rotatePoint([0.5, 0.6], angle),
      });
      const tiltedPlacements = fn(tilted, SIZE, SIZE);

      assert.equal(tiltedPlacements.length, basePlacements.length);
      basePlacements.forEach((p, i) => {
        const expected = rotatePx(p.center, angle, SIZE / 2, SIZE / 2);
        assertClose(tiltedPlacements[i].center, expected, `${name} placement ${i} at ${angle} deg`);
        assert.ok(Math.abs(tiltedPlacements[i].radius - p.radius) < 1e-6, `${name} radius should be roll-invariant`);
      });
    }
  });
}

test("blushPlacements: level face (no roll) matches the plain 'nudge down' offset", () => {
  const lm = makeLandmarks();
  const [right, left] = blushPlacements(lm, SIZE, SIZE);
  // faceWidth = |faceL - faceR| along x on a level face = (0.7-0.3)*1000 = 400
  const faceWidth = 400;
  assertClose(right.center, { x: 0.4 * SIZE, y: 0.55 * SIZE + faceWidth * 0.02 }, "right cheek");
  assertClose(left.center, { x: 0.6 * SIZE, y: 0.55 * SIZE + faceWidth * 0.02 }, "left cheek");
});
