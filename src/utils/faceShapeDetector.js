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
    return { shape: null, landmarks: null, confidence: 0, box: null };
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
   *
   * ข้อจำกัดสำคัญ: 68-landmark ไม่มีจุดที่หน้าผาก/ไรผมเลย (จุดบนสุดคือคิ้ว) ถ้าวัด
   * "ความสูงหน้า" จากคิ้วถึงคาง จะขาดสัดส่วนหน้าผากไปทั้งแถบ (ปกติหน้าผากกินพื้นที่
   * ~1 ใน 3 ของความสูงหน้าตามหลัก facial thirds) ทำให้ heightToWidth ต่ำกว่าจริง
   * อย่างเป็นระบบ และเบี่ยงผลไปทาง Round/Square/Oval บ่อยเกินจริง แก้โดยใช้ขอบบนของ
   * bounding box จริงจากตัว detector แทน (TinyFaceDetector ครอบคลุมถึงหน้าผาก/ไรผม
   * ด้วย ต่างจาก landmark scheme)
   */

  // ความกว้างสูงสุดของหน้า (จุด 0 ถึง 16)
  const faceWidth = pts[16].x - pts[0].x;

  // ความสูงของหน้า (ขอบบนของ face box ซึ่งครอบคลุมหน้าผาก → คาง)
  const faceHeight = pts[8].y - detection.detection.box.top;

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

  const box = detection.detection.box;

  return {
    shape,
    landmarks: pts,
    ratios: { heightToWidth, jawToFace, jawToCheek, foreheadToJaw },
    confidence: detection.detection.score,
    // Detected face box (includes forehead, unlike the landmarks) — lets a
    // caller crop to just the face before sending to a skin-color analyzer,
    // instead of the whole photo (background/hair/clothing included).
    box: { x: box.x, y: box.y, width: box.width, height: box.height },
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
  // เกณฑ์ heightToWidth ปรับขึ้นจากเดิม (1.75/1.3) ให้สอดคล้องกับการวัดความสูงแบบ
  // เต็มหน้า (รวมหน้าผาก) ด้านบน — ค่าเดิมถูก calibrate ไว้ตอนที่ยังวัดจากคิ้วถึงคาง
  // เท่านั้น (ขาดหน้าผากไปราว 1 ใน 3) ถ้าไม่ปรับ ทุกหน้าจะได้ ratio สูงขึ้นเกินจริง
  // และเบี่ยงไปทาง Rectangle ผิดๆ แทน อ้างอิงสัดส่วนที่ใช้กันทั่วไปในการจำแนกรูปหน้า
  // (Oval ~1.5, Oblong/Rectangle >~1.7, Round/Square ~1.0-1.35) ยังเป็นค่าประมาณ
  // ไม่ได้ calibrate จาก labeled dataset จริง

  // Rectangle / Oblong: ยาวมากกว่ากว้างชัดเจน
  if (heightToWidth > 1.7) {
    return "Rectangle";
  }

  // Square: กว้างใกล้เคียงยาว + กรามกว้าง
  if (heightToWidth < 1.35 && jawToFace > 0.75) {
    return "Square";
  }

  // Round: กว้างใกล้เคียงยาว + กรามไม่เหลี่ยม
  if (heightToWidth < 1.35 && jawToFace <= 0.75) {
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
