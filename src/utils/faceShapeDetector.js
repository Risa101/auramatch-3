/**
 * faceShapeDetector.js
 *
 * ใช้ face-api.js ตรวจจับ 68 landmark บนใบหน้า
 * แล้วคำนวณ ratio เพื่อ classify รูปหน้า 6 แบบ
 */

import * as faceapi from "face-api.js";

let modelsLoaded = false;

// โหลดโมเดลจาก /public/models (ทำแค่ครั้งเดียว)
export async function loadFaceModels() {
  if (modelsLoaded) return;
  const MODEL_URL = "/models";
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
}

/**
 * รับ HTMLImageElement หรือ HTMLCanvasElement
 * คืนค่า { shape, landmarks, confidence }
 *
 * shape: "Oval" | "Round" | "Square" | "Heart" | "Diamond" | "Rectangle"
 */
export async function detectFaceShape(imgElement) {
  await loadFaceModels();

  const detection = await faceapi
    .detectSingleFace(imgElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();

  if (!detection) {
    return { shape: null, landmarks: null, confidence: 0 };
  }

  const pts = detection.landmarks.positions; // array ของ {x, y} 68 จุด

  /*
   * จุดสำคัญของ 68-landmark model:
   *  0–16  = เส้นขอบหน้า (jaw line)
   *  17–21 = คิ้วซ้าย
   *  22–26 = คิ้วขวา
   *  27–35 = จมูก
   *  36–41 = ตาซ้าย
   *  42–47 = ตาขวา
   *  48–67 = ปาก
   */

  // ความกว้างสูงสุดของหน้า (จุด 0 ถึง 16)
  const faceWidth = pts[16].x - pts[0].x;

  // ความสูงของหน้า (คิ้ว → คาง)
  const faceHeight = pts[8].y - pts[19].y;

  // ความกว้างกราม (จุด 4 ถึง 12)
  const jawWidth = pts[12].x - pts[4].x;

  // ความกว้างโหนกแก้ม (จุด 1 ถึง 15)
  const cheekWidth = pts[15].x - pts[1].x;

  // ความกว้างหน้าผาก (ประมาณจากคิ้ว: จุด 17 ถึง 26)
  const foreheadWidth = pts[26].x - pts[17].x;

  // ratio หลักที่ใช้ classify
  const heightToWidth = faceHeight / faceWidth;       // ยาว/กว้าง
  const jawToFace = jawWidth / faceWidth;              // กราม/หน้าเต็ม
  const jawToCheek = jawWidth / cheekWidth;            // กราม/โหนกแก้ม
  const foreheadToJaw = foreheadWidth / jawWidth;      // หน้าผาก/กราม

  let shape = classifyShape({
    heightToWidth,
    jawToFace,
    jawToCheek,
    foreheadToJaw,
  });

  return {
    shape,
    landmarks: pts,
    ratios: { heightToWidth, jawToFace, jawToCheek, foreheadToJaw },
    confidence: detection.detection.score,
  };
}

/**
 * Logic classify รูปหน้าจาก ratio
 *
 * อ้างอิงเกณฑ์มาตรฐาน face shape classification:
 * - Oval:      ยาวกว่ากว้างนิดหน่อย, กรามเรียวกว่าโหนกแก้ม
 * - Round:     กว้าง≈ยาว, กรามโค้งมน
 * - Square:    กว้าง≈ยาว, กรามเหลี่ยม (jawToFace สูง)
 * - Heart:     หน้าผากกว้าง, กรามแคบ
 * - Diamond:   โหนกแก้มกว้างสุด, หน้าผากและกรามแคบ
 * - Rectangle: ยาวมาก, กว้างใกล้เคียงกันตลอด
 */
function classifyShape({ heightToWidth, jawToFace, jawToCheek, foreheadToJaw }) {
  // Rectangle / Oblong: ยาวมากกว่ากว้างชัดเจน
  if (heightToWidth > 1.75) {
    return "Rectangle";
  }

  // Square: กว้างใกล้เคียงยาว + กรามกว้าง
  if (heightToWidth < 1.3 && jawToFace > 0.75) {
    return "Square";
  }

  // Round: กว้างใกล้เคียงยาว + กรามไม่เหลี่ยม
  if (heightToWidth < 1.3 && jawToFace <= 0.75) {
    return "Round";
  }

  // Heart: หน้าผากกว้างกว่ากราม
  if (foreheadToJaw > 1.2) {
    return "Heart";
  }

  // Diamond: กรามแคบ + หน้าผากแคบ (โหนกแก้มใหญ่สุด)
  if (foreheadToJaw < 0.85 && jawToCheek < 0.8) {
    return "Diamond";
  }

  // Oval: default (สัดส่วนสมดุล)
  return "Oval";
}

/**
 * แปลง shape (EN) → ชื่อ face shape ที่ใช้ใน faceShapes.js (EN key)
 * เพื่อ map กับ HAIR_STYLE_MAP และ faceShapes data
 */
export const FACE_SHAPE_MAP = {
  Oval: "Oval",
  Round: "Round",
  Square: "Square",
  Heart: "Heart",
  Diamond: "Diamond",
  Rectangle: "Rectangle",
};
