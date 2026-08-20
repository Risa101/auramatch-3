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

/** 478 normalized ([0..1] of image size) landmarks, or null when no face. */
export async function detectFaceLandmarksMP(image) {
  const landmarker = await getLandmarker();
  const result = landmarker.detect(image);
  return result.faceLandmarks[0] ?? null;
}
