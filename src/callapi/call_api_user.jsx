import axios from "axios";

/* ===============================
   API CONFIGURATION
================================ */
const API_BASE_URL = "http://127.0.0.1:5010";

/* ===============================
   ADMIN & AUTHENTICATION
================================ */
export async function GetLogin(email, password) {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/api/login-admin`,
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "เกิดข้อผิดพลาดขณะเข้าสู่ระบบ"
    );
  }
}

/* ===============================
   PRODUCTS
================================ */
export async function getBestSellerProducts() {
  try {
    const res = await axios.get(`${API_BASE_URL}/products/stats/best-seller`);
    return res.data.data || [];
  } catch (error) {
    console.error("Error fetching best sellers:", error);
    return [];
  }
}

export async function getdataProducts() {
  try {
    const res = await axios.get(`${API_BASE_URL}/products`);
    return res.data.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("ไม่สามารถโหลดสินค้าได้");
  }
}

export async function adddataProducts(data) {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/products`,
      {
        name: data.name,
        price: data.price,
        image_url: data.image_url,
        description: data.description,
        category: data.category,
        suitable_for_color: data.suitable_for_color,
        personal_color_tags: data.personal_color_tags,
        status: data.status || "active",
      },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (error) {
    console.error("Error adding product:", error);
    throw new Error("ไม่สามารถเพิ่มสินค้าได้");
  }
}

/* ===============================
   LOOKS
================================ */
export async function getLooksBySeason(season) {
  try {
    const res = await axios.get(`${API_BASE_URL}/looks`, {
      params: { personal_color: season },
    });
    return res.data.data || [];
  } catch (error) {
    console.error(`Error fetching looks for ${season}:`, error);
    return [];
  }
}

/* ===============================
   PROMOTIONS (ปรับปรุงให้ตรงกับ Backend)
================================ */
export async function getdatapromotions() {
  try {
    const res = await axios.get(`${API_BASE_URL}/promotions`);
    // ตรวจสอบว่า Backend ส่งข้อมูลกลับมาในรูปแบบไหน
    if (res.data && res.data.status === "success") {
      return Array.isArray(res.data.data) ? res.data.data : [];
    }
    // ถ้าส่งกลับมาเป็น Array ตรงๆ
    if (Array.isArray(res.data)) return res.data;
    
    return [];
  } catch (error) {
    console.error("API Call failed:", error);
    return []; // ห้าม throw error เพื่อไม่ให้หน้าจอขาว
  }
}
