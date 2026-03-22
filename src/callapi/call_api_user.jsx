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

export const analyzeFaceApi = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await apiClient.post("/api/gemini/analyze-face", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
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
