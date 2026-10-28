import axios from "axios";
import apiClient, { API_BASE_URL } from "../api/client";

/* ===============================
   ADMIN & AUTHENTICATION
================================ */
export async function GetLogin(email, password) {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/api/login`,
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "เกิดข้อผิดพลาดขณะเข้าสู่ระบบ");
  }
}

/* ===============================
   ANALYSIS HISTORY (เชื่อมต่อกับหน้า History)
================================ */
// ดึงประวัติการวิเคราะห์
export const getAnalysisHistory = async (userId) => {
  try {
    if (!userId) return [];
    // Path ตาม backend: /api/analysis-history/<user_id>
    const response = await apiClient.get(`/api/analysis-history/${userId}`);
    
    // ตรวจสอบโครงสร้างข้อมูลที่ส่งกลับมา
    const data = response.data;
    return Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
};

export const saveAnalysisHistory = async (payload) => {
  try {
    const response = await apiClient.post(`/api/save-analysis`, payload);
    return response.data;
  } catch (error) {
    console.error("Error saving analysis:", error);
    return null;
  }
};

// Gemini — used ONLY for the makeup-style suggestion fields (brows/eyes/
// nose/lips) as of this refactor. It no longer returns season/faceShape:
// those were computed here and then unconditionally discarded by the
// classifiers below every single time (see the AI accuracy audit, Critical
// Finding #7) — burning a rate-limited API call for values nothing used.
export const analyzeFaceApi = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await apiClient.post("/api/gemini/analyze-face", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// THE single authoritative Personal Color + skin-undertone source (audit
// Critical Finding #1: this replaces three independent classifiers —
// Gemini's guess, a global-Lab-threshold endpoint, and an unreachable-in-
// production "color engine" proxy — that used to silently overwrite
// data.season in sequence, with no fusion and no confidence comparison).
//
// `landmarksNorm` is the 468/478-point MediaPipe FaceLandmarker output
// (normalized [0,1] x/y/z), detected once client-side via
// src/utils/faceLandmarkerMP.js and reused here so the backend doesn't need
// its own face-detection pass. See services/personal_color_service.py.
export const analyzePersonalColor = async (file, landmarksNorm) => {
  const formData = new FormData();
  formData.append("image", file);
  // MediaPipe's native output is an array of {x, y, z} objects (see
  // faceLandmarkerMP.js) -- that same shape is also fed straight into
  // faceGeometry.js's detectFaceShapeFromLandmarks(), so it can't be changed
  // upstream. The backend (personal_color_service.py) expects plain [x, y, z]
  // arrays and does `np.asarray(landmarks, dtype=float)`, which throws
  // TypeError on a list of dicts. Convert only here, at the point this
  // specific request is serialized, so nothing else that consumes
  // landmarksNorm is affected.
  const landmarksArr = Array.isArray(landmarksNorm)
    ? landmarksNorm.map((p) => (Array.isArray(p) ? p : [p.x, p.y, p.z ?? 0]))
    : landmarksNorm;
  formData.append("landmarks", JSON.stringify(landmarksArr));
  const response = await apiClient.post("/api/personal-color/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// ดึงสินค้าแนะนำจริงจาก DB ตาม personal color season (+ หมวดสินค้า ถ้าระบุ)
// พร้อมลิงก์ร้านค้าจริง (shop_url) — ใช้แทนรายการ hardcode สำหรับหมวดที่มีข้อมูลจริงใน DB
export const getRecommendedProducts = async (season, { category, limit = 8 } = {}) => {
  const params = { season };
  if (category) params.category = category;
  if (limit) params.limit = limit;
  const response = await apiClient.get("/products/recommendations", { params });
  return response.data;
};

export const generateGeminiImage = async ({ file, prompt }) => {
  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("prompt", prompt || "");
    const response = await apiClient.post("/api/gemini/generate-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};


export const deleteAnalysis = async (id) => {
  try {
    const response = await apiClient.delete(`/api/analysis-history/${id}`);
    return response.status === 200;
  } catch (error) {
    console.error("Error deleting analysis:", error);
    return false;
  }
};

/* ===============================
   PRODUCTS
================================ */
function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export async function getBestSellerProducts() {
  try {
    const res = await apiClient.get(`/products/stats/best-seller`);
    return extractList(res.data);
  } catch (error) {
    console.error("Error fetching best sellers:", error);
    return [];
  }
}

export const getdataProducts = async () => {
  try {
    const response = await apiClient.get(`/products`);
    return extractList(response.data);
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
};

export const getProductsBySeason = async (season) => {
  try {
    const response = await apiClient.get(`/products`, { params: { season } });
    return extractList(response.data);
  } catch (error) {
    console.error(`Error fetching products for ${season}:`, error);
    return [];
  }
};

/* ===============================
   PROMOTIONS
================================ */
export async function getPromotions() {
  try {
    const res = await apiClient.get(`/promotions`);
    return extractList(res.data);
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return [];
  }
}

/* ===============================
   BRANDS
================================ */
export async function getdataBrands() {
  try {
    const res = await apiClient.get(`/brands`);
    return extractList(res.data);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

/* ===============================
   LOOKS
================================ */
export async function getLooksBySeason(season) {
  try {
    const res = await apiClient.get(`/looks`, { params: { personal_color: season } });
    return extractList(res.data);
  } catch (error) {
    console.error(`Error fetching looks for ${season}:`, error);
    return [];
  }
}

/* ===============================
   FAVORITES
================================ */
export const toggleFavoriteApi = async (userId, productId) => {
  try {
    const response = await apiClient.post(`/favorites/toggle`, {
      user_id: userId,
      product_id: productId
    });
    return response.data;
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
};

export const getFavoritesByUserApi = async (userId) => {
  try {
    const response = await apiClient.get(`/favorites/${userId}`);
    return extractList(response.data);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
};

/* ===============================
   ADMIN DASHBOARD
================================ */
export const getAdminOverview = async () => {
  try {
    const response = await apiClient.get("/admin/overview");
    return response.data || null;
  } catch (error) {
    console.error("Error fetching admin overview:", error);
    throw error;
  }
};
