#!/usr/bin/env node
/**
 * calibrate_face_shape.mjs
 *
 * "Training" for the face-shape classifier. src/utils/faceGeometry.js is a
 * hand-written decision tree, not a learned model, so the only thing to fit
 * is its six decision thresholds (DEFAULT_THRESHOLDS). This script searches
 * them against human face_shape labels and reports:
 *
 *   1. baseline accuracy with the current DEFAULT_THRESHOLDS
 *   2. cross-validated accuracy of the calibration procedure -- each photo
 *      is predicted by thresholds fitted WITHOUT that photo (leave-one-out
 *      up to 60 samples, deterministic 5-fold above that). This is the
 *      number to report; in-sample accuracy is always optimistic.
 *   3. thresholds fitted on all labeled photos (candidates for production,
 *      written to --output, never applied automatically)
 *
 * Search is coordinate descent over a fixed grid, starting from the
 * defaults; ties prefer the value closest to the default so the fit moves
 * a threshold only when it actually changes a prediction.
 *
 * Usage:
 *   node scripts/calibrate_face_shape.mjs \
 *     --landmarks ../backend_auramatch/evaluation_dataset/landmarks \
 *     --labels    ../backend_auramatch/evaluation_dataset/labels.csv \
 *     [--output   ../backend_auramatch/evaluation_dataset/results/face_shape_thresholds.json]
 *
 * Exits without fitting anything if no row has a face_shape label.
 */

import fs from "node:fs";
import path from "node:path";
import { measureFaceGeometry, classifyFaceShape, DEFAULT_THRESHOLDS } from "../src/utils/faceGeometry.js";

const CLASSES = ["Oval", "Round", "Square", "Heart", "Diamond", "Rectangle"];

const GRID = {
  rectangleHW: range(1.3, 2.0, 0.01),
  shortHW: range(1.0, 1.7, 0.01),
  squareJaw: range(0.6, 0.95, 0.01),
  heartFJ: range(0.9, 1.5, 0.01),
  diamondFJ: range(0.6, 1.1, 0.01),
  diamondJC: range(0.6, 1.0, 0.01),
};

function range(lo, hi, step) {
  const out = [];
  for (let v = lo; v <= hi + 1e-9; v += step) out.push(Math.round(v * 100) / 100);
  return out;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) args[argv[i].slice(2)] = argv[++i];
  }
  return args;
}

// Labels written by assign_dataset_ids.py / the labeling form never contain
// embedded newlines, so a quote-aware split per line is enough here.
function splitCsvLine(line) {
  const out = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { out.push(field); field = ""; }
    else field += c;
  }
  out.push(field);
  return out;
}

function loadSamples(landmarksDir, labelsPath) {
  const [header, ...lines] = fs.readFileSync(labelsPath, "utf8").split(/\r?\n/).filter(Boolean);
  const cols = splitCsvLine(header).map((h) => h.trim());
  const iId = cols.indexOf("image_id");
  const iShape = cols.indexOf("face_shape");
  const samples = [];
  for (const line of lines) {
    const row = splitCsvLine(line);
    const id = (row[iId] || "").trim().replace(/\.[^/.]+$/, "");
    const raw = (row[iShape] || "").trim();
    const truth = CLASSES.find((c) => c.toLowerCase() === raw.toLowerCase());
    if (!id || !truth) continue;
    const p = path.join(landmarksDir, `${id}.landmarks.json`);
    if (!fs.existsSync(p)) { console.log(`  skip ${id}: no landmarks export`); continue; }
    const rec = JSON.parse(fs.readFileSync(p, "utf8"));
    if (!rec.faceDetected) { console.log(`  skip ${id}: no face detected`); continue; }
    const lm = rec.landmarks.map(([x, y, z]) => ({ x, y, z }));
    samples.push({ id, truth, m: measureFaceGeometry(lm, rec.width, rec.height) });
  }
  return samples;
}

function correct(samples, T) {
  let n = 0;
  for (const s of samples) if (classifyFaceShape(s.m, T).shape === s.truth) n++;
  return n;
}

function fit(samples) {
  const T = { ...DEFAULT_THRESHOLDS };
  for (let pass = 0; pass < 4; pass++) {
    let changed = false;
    for (const key of Object.keys(GRID)) {
      let best = T[key];
      let bestScore = correct(samples, T);
      for (const v of GRID[key]) {
        const score = correct(samples, { ...T, [key]: v });
        const closer = Math.abs(v - DEFAULT_THRESHOLDS[key]) < Math.abs(best - DEFAULT_THRESHOLDS[key]);
        if (score > bestScore || (score === bestScore && closer)) { best = v; bestScore = score; }
      }
      if (best !== T[key]) { T[key] = best; changed = true; }
    }
    if (!changed) break;
  }
  return T;
}

function pct(n, d) { return d ? `${((100 * n) / d).toFixed(1)}% (${n}/${d})` : "no data yet"; }

function confusion(pairs) {
  const present = CLASSES.filter((c) => pairs.some((p) => p.truth === c || p.pred === c));
  const lines = [`truth \\ pred  ${present.map((c) => c.padEnd(9)).join(" ")}`];
  for (const t of present) {
    const cells = present.map((p) => String(pairs.filter((x) => x.truth === t && x.pred === p).length).padEnd(9));
    lines.push(`${t.padEnd(13)} ${cells.join(" ")}`);
  }
  return lines.join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.landmarks || !args.labels) {
    console.error("Usage: node scripts/calibrate_face_shape.mjs --landmarks <dir> --labels <labels.csv> [--output <json>]");
    process.exit(2);
  }
  const samples = loadSamples(args.landmarks, args.labels);
  console.log(`Labeled samples with landmarks: ${samples.length}`);
  if (samples.length === 0) {
    console.log("No face_shape labels yet -- nothing to calibrate.");
    return;
  }
  const dist = Object.fromEntries(CLASSES.map((c) => [c, samples.filter((s) => s.truth === c).length]));
  console.log("Label distribution:", dist);

  const baseline = samples.map((s) => ({ truth: s.truth, pred: classifyFaceShape(s.m).shape }));
  const baseN = baseline.filter((p) => p.truth === p.pred).length;

  const k = samples.length <= 60 ? samples.length : 5;
  const loo = new Array(samples.length);
  for (let f = 0; f < k; f++) {
    const T = fit(samples.filter((_, j) => j % k !== f));
    samples.forEach((s, i) => {
      if (i % k === f) loo[i] = { id: s.id, truth: s.truth, pred: classifyFaceShape(s.m, T).shape };
    });
  }
  const cvName = k === samples.length ? "leave-one-out" : `${k}-fold CV`;
  const looN = loo.filter((p) => p.truth === p.pred).length;

  const fitted = fit(samples);
  const inN = correct(samples, fitted);
  const majority = Math.max(...Object.values(dist));

  console.log("\n=== Results ===");
  console.log(`Majority-class guess:          ${pct(majority, samples.length)}`);
  console.log(`Baseline (current thresholds): ${pct(baseN, samples.length)}`);
  console.log(`Calibrated, ${cvName.padEnd(18)}${pct(looN, samples.length)}   <- report this one`);
  console.log(`Calibrated, in-sample:         ${pct(inN, samples.length)}   (optimistic, do not report as accuracy)`);
  console.log("\nBaseline confusion:\n" + confusion(baseline));
  console.log(`\n${cvName} confusion:\n` + confusion(loo));
  console.log("\nThresholds (default -> fitted on all):");
  for (const k of Object.keys(DEFAULT_THRESHOLDS)) {
    console.log(`  ${k.padEnd(12)} ${DEFAULT_THRESHOLDS[k]} -> ${fitted[k]}`);
  }

  if (args.output) {
    fs.mkdirSync(path.dirname(args.output), { recursive: true });
    fs.writeFileSync(args.output, JSON.stringify({
      generatedAt: new Date().toISOString(),
      n: samples.length,
      labelDistribution: dist,
      accuracy: { majority: majority / samples.length, baseline: baseN / samples.length, crossValidated: looN / samples.length, cvMethod: cvName, inSample: inN / samples.length },
      defaultThresholds: DEFAULT_THRESHOLDS,
      fittedThresholds: fitted,
      crossValidatedPredictions: loo,
    }, null, 2));
    console.log(`\nWrote ${args.output}`);
  }
}

main();
