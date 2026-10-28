// Pure-function tests for faceGeometry.js -- no React/DOM/browser APIs
// involved, so these run under Node's built-in test runner with zero new
// dependencies (`npm test`). See the AI accuracy audit's implementation
// brief, Phase 25 ("Face geometry: synthetic normalized measurements",
// "Determinism: same input -> same classification").

import test from "node:test";
import assert from "node:assert/strict";
import {
  alignLandmarks,
  measureFaceGeometry,
  classifyFaceShape,
  detectFaceShapeFromLandmarks,
  faceOvalFeatures,
  predictFaceShape,
  FACE_SHAPES,
} from "./faceGeometry.js";
import faceShapeModel from "../data/faceShapeModel.js";

const SIZE = 1000; // square canvas -> normalized-space rotation == pixel-space rotation

/** Build a full 468-point normalized landmark array with only the indices
 * faceGeometry.js actually reads set to meaningful coordinates; everything
 * else is a harmless (0,0) placeholder.
 */
function makeLandmarks({
  eyeL = [0.3, 0.4], eyeR = [0.7, 0.4],
  forehead = [0.5, 0.1], chin = [0.5, 0.9],
  faceL = [0.2, 0.5], faceR = [0.8, 0.5],
  jawL = [0.3, 0.8], jawR = [0.7, 0.8],
  browL = [0.25, 0.2], browR = [0.75, 0.2],
} = {}) {
  const lm = Array.from({ length: 468 }, () => ({ x: 0, y: 0, z: 0 }));
  const set = (idx, [x, y]) => { lm[idx] = { x, y, z: 0 }; };
  set(33, eyeL); set(263, eyeR);
  set(10, forehead); set(152, chin);
  set(234, faceL); set(454, faceR);
  set(172, jawL); set(397, jawR);
  set(21, browL); set(251, browR);
  return lm;
}

function rotatePoint([x, y], angleDeg, cx = 0.5, cy = 0.5) {
  const a = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(a), sin = Math.sin(a);
  const dx = x - cx, dy = y - cy;
  return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
}

const legacy = (lm) => classifyFaceShape(measureFaceGeometry(lm, SIZE, SIZE));

test("legacy rules: classifies a wide/short face as Round", () => {
  const lm = makeLandmarks();
  const shape = legacy(lm);
  assert.equal(shape.shape, "Round");
  assert.ok(shape.confidence >= 0 && shape.confidence <= 1);
});

test("legacy rules: classifies a narrow/tall face as Rectangle", () => {
  const lm = makeLandmarks({ faceL: [0.35, 0.5], faceR: [0.65, 0.5] });
  const shape = legacy(lm);
  assert.equal(shape.shape, "Rectangle");
});

test("legacy rules: classifies a wide forehead + narrow jaw as Heart", () => {
  const lm = makeLandmarks({
    jawL: [0.4, 0.8], jawR: [0.6, 0.8],   // narrow jaw
    browL: [0.15, 0.2], browR: [0.85, 0.2], // wide forehead
    faceL: [0.25, 0.5], faceR: [0.75, 0.5],
  });
  const shape = legacy(lm);
  assert.equal(shape.shape, "Heart");
});

test("is deterministic: same landmarks in -> same classification out", () => {
  const lm = makeLandmarks();
  const a = detectFaceShapeFromLandmarks(lm, SIZE, SIZE);
  const b = detectFaceShapeFromLandmarks(lm, SIZE, SIZE);
  assert.deepEqual(a, b);
});

test("alignment makes classification invariant to head roll", () => {
  const base = makeLandmarks();
  const baseShape = detectFaceShapeFromLandmarks(base, SIZE, SIZE);

  for (const angle of [10, 20, -15, 35]) {
    // Rotate every point (placeholders included) so the whole face turns as one.
    const rotatedRaw = base.map((p) => {
      const [x, y] = rotatePoint([p.x, p.y], angle);
      return { x, y, z: 0 };
    });
    const rotatedShape = detectFaceShapeFromLandmarks(rotatedRaw, SIZE, SIZE);

    assert.equal(rotatedShape.shape, baseShape.shape, `angle=${angle}`);
    for (const key of ["heightToWidth", "jawToFace", "jawToCheek", "foreheadToJaw"]) {
      assert.ok(
        Math.abs(rotatedShape.measurements[key] - baseShape.measurements[key]) < 1e-6,
        `${key} should be rotation-invariant at angle=${angle}`
      );
    }
    const a = faceOvalFeatures(base, SIZE, SIZE);
    const b = faceOvalFeatures(rotatedRaw, SIZE, SIZE);
    assert.ok(a.every((v, i) => Math.abs(v - b[i]) < 1e-6), `features should be rotation-invariant at angle=${angle}`);
  }
});

test("alignLandmarks reports the roll it corrected", () => {
  const lm = makeLandmarks({ eyeL: [0.3, 0.42], eyeR: [0.7, 0.38] });
  const px = lm.map((p) => ({ x: p.x * SIZE, y: p.y * SIZE }));
  const { rollDeg } = alignLandmarks(px);
  const expected = (Math.atan2(0.38 - 0.42, 0.7 - 0.3) * 180) / Math.PI;
  assert.ok(Math.abs(rollDeg - expected) < 1e-9);
});

test("throws a clear error on too few landmarks instead of measuring garbage", () => {
  assert.throws(() => measureFaceGeometry([{ x: 0.5, y: 0.5 }], SIZE, SIZE));
});

test("legacy rules: a near-tie boundary case reports low (not fabricated-high) confidence", () => {
  // heightToWidth just barely above 1.35 with jawToFace right at 0.75 --
  // sitting almost exactly on the Square/Oval-branch boundary.
  const lm = makeLandmarks({
    faceL: [0.25, 0.5], faceR: [0.75, 0.5], // width 0.5
    jawL: [0.3125, 0.8], jawR: [0.6875, 0.8], // jawWidth 0.375 -> jawToFace = 0.75 exactly
    forehead: [0.5, 0.325], chin: [0.5, 0.9], // height 0.575 -> heightToWidth = 1.15 (Round branch)
  });
  const shape = legacy(lm);
  assert.ok(shape.confidence < 0.05, `expected a near-zero margin, got ${shape.confidence}`);
});

test("model only ever returns one of the six home-page shapes", () => {
  assert.deepEqual(FACE_SHAPES, ["Oval", "Round", "Square", "Heart", "Diamond", "Triangle"]);
  const result = detectFaceShapeFromLandmarks(makeLandmarks(), SIZE, SIZE);
  assert.ok(FACE_SHAPES.includes(result.shape));
  assert.ok(FACE_SHAPES.includes(result.runnerUp));
  assert.notEqual(result.shape, result.runnerUp);
  const total = Object.values(result.probabilities).reduce((s, p) => s + p, 0);
  assert.ok(Math.abs(total - 1) < 1e-9);
  assert.ok(result.confidence > 0 && result.confidence <= 1);
});

test("JS model reproduces sklearn's probabilities on the exported reference vectors", () => {
  for (const ref of faceShapeModel.reference) {
    const { probabilities } = predictFaceShape(ref.features);
    faceShapeModel.classes.forEach((c, k) => {
      assert.ok(Math.abs(probabilities[c] - ref.probabilities[k]) < 1e-4, `${c}: ${probabilities[c]} vs ${ref.probabilities[k]}`);
    });
  }
});
