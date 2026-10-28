/**
 * imageQuality.js
 *
 * Pre-analysis image-quality gate (AI accuracy audit, Phase 3). Before this
 * refactor NOTHING checked resolution/blur/exposure/face-size/head-angle --
 * Analysis.jsx only validated MIME type and file size (see the audit's
 * "Image Input Quality Audit"). A severely blurry, underexposed, or
 * face-less photo went straight into the full analysis pipeline and still
 * came back with a confident-looking season and face shape.
 *
 * Returns one of three levels (never a 4th "trust me" state):
 *   - "good"    : proceed normally.
 *   - "warning" : proceed, but the result should be shown as lower-
 *                 reliability (the caller is expected to fold this into
 *                 whatever confidence/reliability badge it renders).
 *   - "reject"  : do NOT run analysis. Ask the user to retake the photo.
 *                 Per the brief: "do not fabricate a season... return a
 *                 useful message asking the user to retake the photo."
 *
 * All thresholds are heuristic and explicitly uncalibrated (same honesty
 * standard as every other threshold introduced in this refactor -- there is
 * no labeled dataset of "good vs. bad photo" in this project either). They
 * are deliberately permissive per the brief's "do not reject normal
 * photographs unnecessarily" -- REJECT is reserved for cases where the
 * downstream measurement would be closer to noise than signal.
 */

// --- resolution ---------------------------------------------------------
const MIN_DIM_REJECT = 180; // below this, skin-region pixel counts are too small to trust
const MIN_DIM_WARN = 420;

// --- face size relative to image width (from measureFaceGeometry's faceWidth) ---
const FACE_FRAC_REJECT = 0.08; // face barely present in frame
const FACE_FRAC_WARN = 0.18;

// --- head roll (degrees, from faceGeometry.alignLandmarks) ---
const ROLL_REJECT_DEG = 40;
const ROLL_WARN_DEG = 15;

// --- exposure (mean luma, 0-255) ---
const LUMA_DARK_REJECT = 25;
const LUMA_DARK_WARN = 55;
const LUMA_BRIGHT_REJECT = 245;
const LUMA_BRIGHT_WARN = 220;
const CLIPPED_FRACTION_WARN = 0.35; // fraction of pixels pinned near 0 or 255

// --- blur (variance of a Laplacian response over a downsampled grayscale image) ---
// KNOWN LIMITATION: this is the standard "variance of Laplacian" blur proxy,
// which conflates "genuinely out of focus" with "naturally low-texture /
// softly lit" -- a smooth, evenly-lit face can legitimately score lower than
// a busy, textured background. Treated as a coarse signal, not ground truth;
// see the REJECT threshold's deliberate permissiveness above.
const BLUR_VARIANCE_REJECT = 6; // near-uniform response -> almost certainly unusable
const BLUR_VARIANCE_WARN = 25;
const BLUR_SAMPLE_WIDTH = 200;

function toGrayscale(imageData) {
  const { data, width, height } = imageData;
  const gray = new Float32Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    // Rec. 601 luma -- consistent with how most quick "is this dark/bright"
    // checks are done; not claiming perceptual precision beyond that.
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return { gray, width, height };
}

function laplacianVariance(gray, width, height) {
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const lap =
        4 * gray[idx] -
        gray[idx - 1] -
        gray[idx + 1] -
        gray[idx - width] -
        gray[idx + width];
      sum += lap;
      sumSq += lap * lap;
      n++;
    }
  }
  if (n === 0) return 0;
  const mean = sum / n;
  return sumSq / n - mean * mean;
}

function sampleImageStats(imgEl) {
  const scale = Math.min(1, BLUR_SAMPLE_WIDTH / imgEl.naturalWidth);
  const w = Math.max(1, Math.round(imgEl.naturalWidth * scale));
  const h = Math.max(1, Math.round(imgEl.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imgEl, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const { gray } = toGrayscale(imageData);

  let sum = 0;
  let clipped = 0;
  for (let i = 0; i < gray.length; i++) {
    sum += gray[i];
    if (gray[i] < 8 || gray[i] > 247) clipped++;
  }
  const meanLuma = sum / gray.length;
  const clippedFraction = clipped / gray.length;
  const blurVariance = laplacianVariance(gray, w, h);

  return { meanLuma, clippedFraction, blurVariance };
}

/**
 * @param {HTMLImageElement} imgEl - the decoded photo (already EXIF-oriented
 *   by the browser's own <img>/canvas decode path).
 * @param {{ faceWidthFraction: number|null, rollDeg: number|null } | null} faceInfo
 *   - faceWidthFraction: measured face width / image width (null if no face
 *     landmarks were available at all -- treated as an automatic REJECT).
 *   - rollDeg: from faceGeometry.alignLandmarks, or null if unavailable.
 * @returns {{
 *   level: "good"|"warning"|"reject",
 *   reasons: string[],
 *   messageTh: string|null,
 *   diagnostics: object
 * }}
 */
export function assessImageQuality(imgEl, faceInfo) {
  const reasons = [];
  const warnings = [];

  const minDim = Math.min(imgEl.naturalWidth, imgEl.naturalHeight);
  if (minDim < MIN_DIM_REJECT) reasons.push(`resolution_too_low(${minDim}px)`);
  else if (minDim < MIN_DIM_WARN) warnings.push(`resolution_low(${minDim}px)`);

  if (!faceInfo || faceInfo.faceWidthFraction == null) {
    // Covers two distinct upstream causes the caller collapses into one
    // signal: MediaPipe genuinely found no face, OR it found one but the
    // face-geometry measurement step threw. Either way this module never
    // learns which -- so the reason names the actual condition it can see
    // (no usable measurement), not a detection failure that may not have
    // occurred.
    reasons.push("face_measurement_unavailable");
  } else {
    if (faceInfo.faceWidthFraction < FACE_FRAC_REJECT) reasons.push("face_too_small");
    else if (faceInfo.faceWidthFraction < FACE_FRAC_WARN) warnings.push("face_small");

    if (faceInfo.rollDeg != null) {
      const absRoll = Math.abs(faceInfo.rollDeg);
      if (absRoll > ROLL_REJECT_DEG) reasons.push(`head_angle_extreme(${absRoll.toFixed(1)}deg)`);
      else if (absRoll > ROLL_WARN_DEG) warnings.push(`head_angle_tilted(${absRoll.toFixed(1)}deg)`);
    }
  }

  const stats = sampleImageStats(imgEl);
  if (stats.meanLuma < LUMA_DARK_REJECT) reasons.push("severely_underexposed");
  else if (stats.meanLuma < LUMA_DARK_WARN) warnings.push("underexposed");
  if (stats.meanLuma > LUMA_BRIGHT_REJECT) reasons.push("severely_overexposed");
  else if (stats.meanLuma > LUMA_BRIGHT_WARN) warnings.push("overexposed");
  if (stats.clippedFraction > CLIPPED_FRACTION_WARN) warnings.push("high_clipping");

  if (stats.blurVariance < BLUR_VARIANCE_REJECT) reasons.push("severely_blurry");
  else if (stats.blurVariance < BLUR_VARIANCE_WARN) warnings.push("possibly_blurry");

  const diagnostics = { ...stats, minDim, ...faceInfo };

  if (reasons.length > 0) {
    return { level: "reject", reasons, messageTh: REJECT_MESSAGE_TH, diagnostics };
  }
  if (warnings.length > 0) {
    return { level: "warning", reasons: warnings, messageTh: null, diagnostics };
  }
  return { level: "good", reasons: [], messageTh: null, diagnostics };
}

const REJECT_MESSAGE_TH =
  "ภาพนี้ไม่ชัดเจนพอสำหรับการวิเคราะห์ (อาจเบลอ มืด/สว่างเกินไป หรือมองไม่เห็นใบหน้าชัดเจน) กรุณาถ่ายรูปใหม่ในที่แสงสว่างเพียงพอ หันหน้าตรงเข้ากล้อง และให้ใบหน้าอยู่กลางเฟรม";
