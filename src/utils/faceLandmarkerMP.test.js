// Pure-function tests for averageLandmarkPasses() -- the multi-pass
// stabilization logic in faceLandmarkerMP.js. detectFaceLandmarksMP() itself
// needs a real MediaPipe model and isn't unit-tested (same as before this
// change); only the pure aggregation math is tested here.
import test from "node:test";
import assert from "node:assert/strict";
import { averageLandmarkPasses } from "./faceLandmarkerMP.js";

test("averages x/y/z per landmark index across passes", () => {
  const passA = [{ x: 0.1, y: 0.2, z: 0.0 }, { x: 0.5, y: 0.5, z: 0.1 }];
  const passB = [{ x: 0.3, y: 0.4, z: 0.2 }, { x: 0.7, y: 0.3, z: 0.3 }];
  const out = averageLandmarkPasses([passA, passB]);
  const expected = [
    { x: 0.2, y: 0.3, z: 0.1 },
    { x: 0.6, y: 0.4, z: 0.2 },
  ];
  out.forEach((point, i) => {
    assert.ok(Math.abs(point.x - expected[i].x) < 1e-9);
    assert.ok(Math.abs(point.y - expected[i].y) < 1e-9);
    assert.ok(Math.abs(point.z - expected[i].z) < 1e-9);
  });
});

test("a single pass averages to itself (no distortion when jitter is absent)", () => {
  const pass = [{ x: 0.42, y: 0.17, z: 0.05 }];
  const out = averageLandmarkPasses([pass]);
  assert.deepEqual(out, pass);
});

test("returns null for zero passes (e.g. every detect() call found no face)", () => {
  assert.equal(averageLandmarkPasses([]), null);
});

test("treats a missing z as 0 instead of producing NaN", () => {
  const passA = [{ x: 0.5, y: 0.5 }]; // no z, matches MediaPipe's occasional shape
  const passB = [{ x: 0.5, y: 0.5, z: 0.2 }];
  const out = averageLandmarkPasses([passA, passB]);
  assert.equal(out[0].z, 0.1);
});

test("reduces jitter: averaging noisy passes lands closer to the true value than any single noisy pass", () => {
  const truth = 0.5;
  const noisy = [truth - 0.02, truth + 0.03, truth - 0.01, truth + 0.02, truth - 0.015];
  const passes = noisy.map((x) => [{ x, y: 0, z: 0 }]);
  const out = averageLandmarkPasses(passes);
  const maxSingleError = Math.max(...noisy.map((x) => Math.abs(x - truth)));
  const averagedError = Math.abs(out[0].x - truth);
  assert.ok(averagedError < maxSingleError);
});
