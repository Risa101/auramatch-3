/**
 * aiLogger.js
 *
 * เก็บ log ทุกครั้งที่ AI ทำงานใน AuraMatch
 * บันทึกลง Firestore collection: "ai_logs"
 *
 * ข้อมูลที่เก็บ:
 *  - timestamp     : เวลาที่ AI ทำงาน
 *  - userId        : ผู้ใช้งาน (ถ้า login)
 *  - modelUsed     : โมเดลที่ใช้ ("face-api.js" | "RandomForest" | "Gemini")
 *  - input         : ข้อมูลที่ป้อนเข้าโมเดล
 *  - output        : ผลลัพธ์ที่ได้
 *  - confidence    : ความมั่นใจของโมเดล (0-1)
 *  - processingMs  : เวลาที่ใช้ (milliseconds)
 *  - success       : สำเร็จหรือไม่
 *  - errorMessage  : ข้อความ error (ถ้ามี)
 */

import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const AI_LOGS_COLLECTION = "ai_logs";

/**
 * บันทึก log การใช้ AI
 *
 * @param {object} params
 * @param {string} params.modelUsed    - ชื่อโมเดล: "face-api.js" | "RandomForest" | "Gemini"
 * @param {string} params.task         - งานที่ทำ: "face_shape" | "seasonal_color" | "makeup_generation"
 * @param {object} params.input        - ข้อมูล input (ไม่ใส่รูปภาพ ใส่แค่ feature)
 * @param {any}    params.output       - ผลลัพธ์
 * @param {number} params.confidence   - ความมั่นใจ 0-1 (optional)
 * @param {number} params.processingMs - เวลาที่ใช้ ms (optional)
 * @param {boolean} params.success     - สำเร็จไหม
 * @param {string} params.errorMessage - ข้อความ error (ถ้า fail)
 * @param {string} params.userId       - userId (optional)
 */
export async function logAiCall({
  modelUsed,
  task,
  input = {},
  output = null,
  confidence = null,
  processingMs = null,
  success = true,
  errorMessage = null,
  userId = null,
}) {
  try {
    const logEntry = {
      timestamp: serverTimestamp(),
      userId: userId || "anonymous",
      modelUsed,
      task,
      input,
      output,
      confidence,
      processingMs,
      success,
      errorMessage,
    };

    await addDoc(collection(db, AI_LOGS_COLLECTION), logEntry);
  } catch (err) {
    // ไม่ให้ error จาก logging หยุดการทำงานหลัก
    console.warn("[aiLogger] Failed to save log:", err);
  }
}
