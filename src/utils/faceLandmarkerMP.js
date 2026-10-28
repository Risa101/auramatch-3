/**
 * faceLandmarkerMP.js
 *
 * Browser-side MediaPipe FaceLandmarker (IMAGE mode, 478 landmarks) for the
 * makeup studio. Runs entirely on-device — the photo never leaves the browser.
 * The wasm bundle + model are lazy-loaded on first use so the upload/analysis
 * flow doesn't pay for them. Ported from auramatchgenz (frontend/src/lib/faceLandmarker.ts).
 */

const WASM_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

let landmarkerPromise = null;

function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FilesetResolver, FaceLandmarker } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(WASM_CDN);
      return FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: "IMAGE",
        numFaces: 1,
      });
    })();
    // A failed load must not poison every later attempt with the same rejection.
    landmarkerPromise.catch(() => {
      landmarkerPromise = null;
    });
  }
  return landmarkerPromise;
}

// MediaPipe's IMAGE-mode inference on the same still photo is not perfectly
// repeatable -- WASM SIMD float summation order can vary slightly between
// detect() calls on identical pixel input, and that per-run jitter is enough
// to flip a borderline personal-color result (season/undertone) between
// otherwise-identical uploads of the same photo. Neither
// services/personal_color_service.py nor src/utils/faceGeometry.js is
// touched to fix this -- both are deterministic given identical landmarks
// (see backend's test_analyze_personal_color_is_deterministic). The fix
// belongs upstream, at the noisy input: run detection several times on the
// same static image and average the coordinates before anything downstream
// ever sees them.
const STABILIZATION_PASSES = 5;

/** Per-index mean of x/y/z across several detect() passes on the same
 * image. Pure function (no MediaPipe dependency) so it's unit-testable
 * without a real model. */
export function averageLandmarkPasses(passes) {
  if (!passes.length) return null;
  const count = passes[0].length;
  const out = new Array(count);
  for (let i = 0; i < count; i++) {
    let sx = 0, sy = 0, sz = 0;
    for (const pass of passes) {
      sx += pass[i].x;
      sy += pass[i].y;
      sz += pass[i].z ?? 0;
    }
    out[i] = { x: sx / passes.length, y: sy / passes.length, z: sz / passes.length };
  }
  return out;
}

/** 478 normalized ([0..1] of image size) landmarks, averaged over several
 * detection passes to smooth out per-run jitter, or null when no face. */
export async function detectFaceLandmarksMP(image) {
  const landmarker = await getLandmarker();
  const passes = [];
  for (let i = 0; i < STABILIZATION_PASSES; i++) {
    const result = landmarker.detect(image);
    const landmarks = result.faceLandmarks[0];
    if (landmarks) passes.push(landmarks);
  }
  return averageLandmarkPasses(passes);
}
