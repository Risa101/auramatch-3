#!/usr/bin/env node
/**
 * evaluate_face_shape.mjs
 *
 * Batch real-photo evaluation for face-shape classification -- the Node
 * counterpart to backend_auramatch/scripts/evaluate_personal_color.py.
 *
 * Deliberately in Node, not Python: face-shape classification's actual
 * source of truth is src/utils/faceGeometry.js, already tested (see
 * faceGeometry.test.js). Reusing it directly here means there is exactly
 * ONE implementation of the decision tree to keep correct, instead of a
 * second Python port that could silently drift out of sync with production.
 *
 * Consumes the SAME landmark export
 * backend_auramatch/scripts/export_landmarks.py produces (normalized [0,1]
 * x/y/z, >= 468 points) and the SAME evaluation_dataset/labels.csv (reads
 * its `face_shape` column) -- see backend_auramatch/evaluation_dataset/README.md.
 *
 * Usage:
 *   node scripts/evaluate_face_shape.mjs \
 *     --landmarks ../backend_auramatch/evaluation_dataset/landmarks \
 *     --labels    ../backend_auramatch/evaluation_dataset/labels.csv \
 *     [--output   ../backend_auramatch/evaluation_dataset/face_shape_results.csv]
 *
 * NO DATA = NO FAKE RESULTS (audit real-photo brief, section 27): with zero
 * labeled face_shape rows, this prints "no data yet" for every metric and
 * exits cleanly -- it does not invent a number.
 *
 * Rotation robustness (section 24): if export_landmarks.py was run with
 * --rotations, this script automatically picks up the
 * "<stem>__rot<deg>.landmarks.json" variants sitting next to each base
 * export and reports how much heightToWidth/jawToFace/jawToCheek/
 * foreheadToJaw actually vary across real re-detections at different head
 * angles -- NOT just the synthetic single-fixture rotation already covered
 * by faceGeometry.test.js.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { detectFaceShapeFromLandmarks, classifyFaceShape, measureFaceGeometry } from "../src/utils/faceGeometry.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLASSES = ["Oval", "Round", "Square", "Heart", "Diamond", "Triangle"];

// --- tiny RFC4180-ish CSV parser (quoted fields with embedded commas) ---
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function loadLabels(csvPath) {
  const text = fs.readFileSync(csvPath, "utf8");
  const [header, ...rows] = parseCsv(text);
  const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
  const labels = new Map();
  for (const row of rows) {
    const imageId = (row[idx.image_id] || "").trim();
    if (!imageId) continue;
    labels.set(imageId, {
      face_shape: (row[idx.face_shape] || "").trim() || null,
      lighting: (row[idx.lighting] || "").trim() || null,
    });
  }
  return labels;
}

function stemOf(imageId) {
  return imageId.replace(/\.[^/.]+$/, "");
}

function loadLandmarkRecord(landmarksDir, stem, suffix = "") {
  const p = path.join(landmarksDir, `${stem}${suffix}.landmarks.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function findRotationVariants(landmarksDir, stem) {
  const files = fs.readdirSync(landmarksDir);
  const re = new RegExp(`^${stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}__rot([+-]?\\d+)\\.landmarks\\.json$`);
  return files
    .map((f) => f.match(re))
    .filter(Boolean)
    .map((m) => ({ deg: parseInt(m[1], 10), record: loadLandmarkRecord(landmarksDir, stem, `__rot${m[1]}`) }));
}

// --- metrics (mirrors services/eval/metrics.py's arithmetic; not shared
// code since one is Python and one is JS, but the same formulas) ---
function accuracy(rows) {
  if (!rows.length) return null;
  return rows.filter((r) => r.predicted === r.truth).length / rows.length;
}
function balancedAccuracy(rows, classes) {
  const recalls = [];
  for (const c of classes) {
    const support = rows.filter((r) => r.truth === c);
    if (!support.length) continue;
    recalls.push(support.filter((r) => r.predicted === c).length / support.length);
  }
  return recalls.length ? recalls.reduce((a, b) => a + b, 0) / recalls.length : null;
}
function precisionRecallF1(rows, cls) {
  const tp = rows.filter((r) => r.truth === cls && r.predicted === cls).length;
  const fp = rows.filter((r) => r.truth !== cls && r.predicted === cls).length;
  const fn = rows.filter((r) => r.truth === cls && r.predicted !== cls).length;
  const precision = tp + fp ? tp / (tp + fp) : null;
  const recall = tp + fn ? tp / (tp + fn) : null;
  const f1 = precision != null && recall != null && precision + recall > 0
    ? (2 * precision * recall) / (precision + recall) : null;
  return { precision, recall, f1, support: tp + fn };
}
function confusionMatrix(rows, classes) {
  const cols = [...classes, "NO_PREDICTION"];
  const matrix = Object.fromEntries(classes.map((c) => [c, Object.fromEntries(cols.map((k) => [k, 0]))]));
  for (const r of rows) {
    const truth = matrix[r.truth] ? r.truth : null;
    if (!truth) continue;
    const pred = classes.includes(r.predicted) ? r.predicted : "NO_PREDICTION";
    matrix[truth][pred] += 1;
  }
  return matrix;
}
function fmtPct(x) { return x == null ? "no data yet" : `${(x * 100).toFixed(1)}%`; }
function fmt(x) { return x == null ? "no data yet" : x.toFixed(3); }

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      args[key] = value;
    }
  }
  return args;
}

function toCsv(rows) {
  const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))].sort();
  const esc = (v) => (v == null ? "" : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  return [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.landmarks || !args.labels) {
    console.error("Usage: node scripts/evaluate_face_shape.mjs --landmarks <dir> --labels <labels.csv> [--output <csv>]");
    process.exit(1);
  }
  const landmarksDir = path.resolve(args.landmarks);
  const labelsPath = path.resolve(args.labels);

  const labels = loadLabels(labelsPath);
  if (labels.size === 0) {
    console.log(`No rows in ${labelsPath} -- see backend_auramatch/evaluation_dataset/README.md for the format.`);
    console.log("\n=== Face Shape Evaluation ===\nno data yet\n");
    return;
  }

  const rows = [];
  const rotationReports = [];
  let skipped = 0;

  for (const [imageId, label] of labels.entries()) {
    const stem = stemOf(imageId);
    const record = loadLandmarkRecord(landmarksDir, stem);
    if (!record || !record.faceDetected) {
      skipped++;
      console.log(`  skip ${imageId}: missing or face-less landmarks export`);
      continue;
    }

    const landmarks = record.landmarks.map(([x, y, z]) => ({ x, y, z }));
    let result;
    try {
      result = detectFaceShapeFromLandmarks(landmarks, record.width, record.height);
    } catch (err) {
      skipped++;
      console.log(`  skip ${imageId}: ${err.message}`);
      continue;
    }

    rows.push({
      image_id: imageId,
      truth: label.face_shape,
      predicted: result.shape,
      confidence: result.confidence,
      rollDeg: result.measurements.rollDeg,
      heightToWidth: result.measurements.heightToWidth,
      jawToFace: result.measurements.jawToFace,
      foreheadToJaw: result.measurements.foreheadToJaw,
    });

    const rotationVariants = findRotationVariants(landmarksDir, stem);
    if (rotationVariants.length) {
      const perAngle = [{ deg: 0, ...measureAndClassify(landmarks, record.width, record.height) }];
      for (const { deg, record: rRecord } of rotationVariants) {
        if (!rRecord?.faceDetected) {
          perAngle.push({ deg, shape: null, error: "no face detected at this rotation" });
          continue;
        }
        const rLandmarks = rRecord.landmarks.map(([x, y, z]) => ({ x, y, z }));
        try {
          perAngle.push({ deg, ...measureAndClassify(rLandmarks, rRecord.width, rRecord.height) });
        } catch (err) {
          perAngle.push({ deg, shape: null, error: err.message });
        }
      }
      rotationReports.push({ imageId, perAngle });
    }
  }

  if (args.output) {
    fs.writeFileSync(path.resolve(args.output), toCsv(rows));
    console.log(`\nWrote per-image results to ${args.output}`);
  }

  const labeled = rows.filter((r) => CLASSES.includes(r.truth));

  console.log("\n=== Face Shape Evaluation ===\n");
  console.log(`Images evaluated: ${rows.length}, labeled: ${labeled.length}, skipped: ${skipped}\n`);
  console.log(`Accuracy: ${fmtPct(accuracy(labeled))}`);
  console.log(`Balanced Accuracy: ${fmtPct(balancedAccuracy(labeled, CLASSES))}\n`);

  console.log("Per-class:");
  for (const c of CLASSES) {
    const { precision, recall, f1, support } = precisionRecallF1(labeled, c);
    console.log(`  ${c.padEnd(10)} precision=${fmt(precision)} recall=${fmt(recall)} f1=${fmt(f1)} support=${support}`);
  }

  console.log("\nConfusion matrix (rows=truth, cols=predicted):");
  const matrix = confusionMatrix(labeled, CLASSES);
  const cols = [...CLASSES, "NO_PREDICTION"];
  console.log("           " + cols.map((c) => c.padStart(10)).join(" "));
  for (const truth of CLASSES) {
    console.log(truth.padEnd(10) + " " + cols.map((c) => String(matrix[truth][c]).padStart(10)).join(" "));
  }

  if (rotationReports.length) {
    console.log(`\n=== Rotation Robustness (section 24, ${rotationReports.length} images with rotation variants) ===`);
    for (const { imageId, perAngle } of rotationReports) {
      const shapes = perAngle.map((a) => a.shape);
      const stable = new Set(shapes.filter(Boolean)).size <= 1;
      const heightToWidthValues = perAngle.map((a) => a.heightToWidth).filter((v) => v != null);
      const spread = heightToWidthValues.length ? Math.max(...heightToWidthValues) - Math.min(...heightToWidthValues) : null;
      console.log(`  ${imageId}: shapes across angles = [${perAngle.map((a) => `${a.deg}°:${a.shape ?? "FAIL"}`).join(", ")}]`
        + ` | classification ${stable ? "STABLE" : "CHANGED"} | heightToWidth spread=${spread != null ? spread.toFixed(4) : "n/a"}`);
    }
    console.log(
      "\nNote: this measures real MediaPipe re-detection at each rotated angle (images rotated in-memory by "
      + "export_landmarks.py --rotations, then re-detected), not just the alignment math on a fixed synthetic "
      + "landmark set -- that synthetic check already exists in faceGeometry.test.js and only proves the roll-"
      + "correction FORMULA is correct, not that detection itself stays accurate under real rotation."
    );
  } else {
    console.log("\n(No rotation variants found -- run export_landmarks.py with --rotations to enable this check.)");
  }

  if (labeled.length === 0) {
    console.log("\n*** NO LABELED FACE-SHAPE DATA -- every metric above reads 'no data yet'. ***");
  } else if (labeled.length < 30) {
    console.log(`\nNote: only ${labeled.length} labeled images -- treat these numbers as directional, not verified accuracy.`);
  }
}

function measureAndClassify(landmarks, width, height) {
  const measurements = measureFaceGeometry(landmarks, width, height);
  const result = classifyFaceShape(measurements);
  return { shape: result.shape, heightToWidth: measurements.heightToWidth };
}

main();
