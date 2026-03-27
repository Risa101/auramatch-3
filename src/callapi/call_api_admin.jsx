import apiClient from "../api/client";

const normalizeList = (res) => {
  const body = res?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.users)) return body.users;
  if (Array.isArray(body?.user)) return body.user;
  if (Array.isArray(body?.rows)) return body.rows;
  if (Array.isArray(body?.results)) return body.results;
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body?.payload)) return body.payload;
  if (Array.isArray(body?.data?.users)) return body.data.users;
  if (Array.isArray(body?.data?.user)) return body.data.user;
  if (Array.isArray(body?.data?.rows)) return body.data.rows;
  if (Array.isArray(body?.data?.results)) return body.data.results;
  if (Array.isArray(body?.data?.result)) return body.data.result;

  if (body && typeof body === "object" && !Array.isArray(body)) {
    const values = Object.values(body);
    if (values.length && values.every((v) => v && typeof v === "object")) {
      return values;
    }
  }

  if (body?.data && typeof body.data === "object" && !Array.isArray(body.data)) {
    const values = Object.values(body.data);
    if (values.length && values.every((v) => v && typeof v === "object")) {
      return values;
    }
  }
  return [];
};

const normalizeItem = (res) => {
  const body = res?.data;
  if (!body) return null;
  return body?.data || body?.item || body;
};

const normalizeProduct = (item) => ({
  id: item?.product_id ?? item?.id,
  name: item?.name ?? item?.product_name ?? "",
  price: Number(item?.price ?? 0),
  stock: Number(item?.stock ?? item?.qty ?? item?.quantity ?? 0),
  category: item?.category ?? item?.product_type ?? item?.type ?? "",
  image_url: item?.image_url ?? item?.image ?? "",
  personal_color_tags: item?.personal_color_tags ?? item?.seasonTags ?? "",
  status: item?.status ?? "active",
});

const normalizeUser = (item) => ({
  id: item?.user_id ?? item?.id,
  username: item?.username ?? item?.name ?? item?.full_name ?? "",
  email: item?.email ?? "",
  role: item?.role ?? "user",
  deleted_at: item?.deleted_at ?? null,
  created_at: item?.created_at ?? item?.createdAt ?? null,
});

const normalizePromotion = (item) => ({
  id: item?.promotion_id ?? item?.id,
  title: item?.title ?? item?.name ?? item?.promotion_name ?? item?.promo_name ?? "",
  code: item?.code ?? item?.promo_code ?? "",
  description: item?.description ?? item?.detail ?? item?.promo_detail ?? "",
  discount_percent: Number(item?.discount_percent ?? item?.discount ?? 0),
  start_date: item?.start_date ?? item?.startDate ?? "",
  end_date: item?.end_date ?? item?.endDate ?? "",
  status: item?.status ?? "active",
  brand_id: item?.brand_id ?? null,
  superadmin_id: item?.superadmin_id ?? null,
});

const normalizeReview = (item) => ({
  id: item?.review_id ?? item?.id,
  user_id: item?.user_id ?? item?.uid ?? null,
  product_id: item?.product_id ?? item?.pid ?? null,
  rating: Number(item?.rating ?? item?.score ?? 0),
  comment: item?.comment ?? item?.review_text ?? item?.content ?? "",
  created_at: item?.created_at ?? item?.createdAt ?? "",
  status: item?.status ?? (item?.deleted_at ? "deleted" : "active"),
});

async function requestWithFallback(configs) {
  let lastError;
  for (const cfg of configs) {
    try {
      return await apiClient.request(cfg);
    } catch (err) {
      if (err?.response?.status === 404) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError || new Error("No matching API endpoint");
}

export async function getAdminProducts() {
  const res = await requestWithFallback([
    { method: "get", url: "/admin/products" },
    { method: "get", url: "/products" },
  ]);
  return normalizeList(res).map(normalizeProduct);
}

export async function getStockList() {
  const res = await apiClient.get("/stock");
  return normalizeList(res);
}

export async function createStockItem({ product_id, quantity }) {
  const body = {
    product_id: Number(product_id),
    quantity: Number(quantity),
  };
  const res = await apiClient.post("/stock", body);
  return normalizeItem(res) || res?.data || null;
}

export async function updateStockItem(stock_id, { quantity }) {
  const body = { quantity: Number(quantity) };
  const res = await apiClient.put(`/stock/${Number(stock_id)}`, body);
  return normalizeItem(res) || res?.data || null;
}

export async function deleteStockItem(stock_id) {
  await apiClient.delete(`/stock/${Number(stock_id)}`);
  return true;
}

export async function createAdminProduct(payload) {
  const res = await apiClient.post("/admin/products", payload);
  return normalizeItem(res) || res?.data || null;
}

export async function updateAdminProduct(product_id, payload) {
  const res = await apiClient.put(`/admin/products/${encodeURIComponent(product_id)}`, payload);
  return normalizeItem(res) || res?.data || null;
}

export async function deleteAdminProduct(product_id) {
  await apiClient.delete(`/admin/products/${encodeURIComponent(product_id)}`);
  return true;
}

export async function getAdminUsers() {
  const res = await apiClient.get("/admin/users");
  return normalizeList(res).map(normalizeUser);
}

export async function createAdminUser(payload) {
  const res = await apiClient.post("/admin/users", payload);
  return normalizeUser(normalizeItem(res) || res?.data || {});
}

export async function updateAdminUser(user_id, payload) {
  const res = await apiClient.put(`/admin/users/${encodeURIComponent(user_id)}`, payload);
  return normalizeUser(normalizeItem(res) || res?.data || {});
}

export async function deleteAdminUser(user_id) {
  await apiClient.delete(`/admin/users/${encodeURIComponent(user_id)}`);
  return true;
}

export async function getAdminPromotions() {
  const res = await requestWithFallback([
    { method: "get", url: "/admin/promotions" },
    { method: "get", url: "/promotions" },
  ]);
  return normalizeList(res).map(normalizePromotion);
}

function toPromotionPayload(payload) {
  return {
    ...payload,
    promo_name: payload?.promo_name ?? payload?.title ?? "",
    promo_detail: payload?.promo_detail ?? payload?.description ?? "",
    brand_id: payload?.brand_id != null ? Number(payload.brand_id) : null,
    superadmin_id: payload?.superadmin_id != null ? Number(payload.superadmin_id) : null,
  };
}

export async function createAdminPromotion(payload) {
  const data = toPromotionPayload(payload);
  const res = await apiClient.post("/admin/promotions", data);
  return normalizePromotion(normalizeItem(res) || res?.data || {});
}

export async function updateAdminPromotion(promotion_id, payload) {
  const data = toPromotionPayload(payload);
  const res = await apiClient.put(`/admin/promotions/${encodeURIComponent(promotion_id)}`, data);
  return normalizePromotion(normalizeItem(res) || res?.data || {});
}

export async function deleteAdminPromotion(promotion_id) {
  await apiClient.delete(`/admin/promotions/${encodeURIComponent(promotion_id)}`);
  return true;
}

export async function getAdminReviews() {
  const res = await apiClient.get("/admin/reviews");
  return normalizeList(res).map(normalizeReview);
}

export async function createAdminReview(payload) {
  const data = {
    user_id: Number(payload?.user_id || 0),
    product_id: Number(payload?.product_id || 0),
    rating: Number(payload?.rating || 0),
    comment: payload?.comment || "",
  };
  const res = await apiClient.post("/admin/reviews", data);
  return normalizeReview(normalizeItem(res) || res?.data || {});
}

export async function updateAdminReview(review_id, payload) {
  const data = {
    rating: payload?.rating != null ? Number(payload.rating) : undefined,
    comment: payload?.comment,
  };
  const res = await apiClient.put(`/admin/reviews/${encodeURIComponent(review_id)}`, data);
  return normalizeReview(normalizeItem(res) || res?.data || {});
}

export async function deleteAdminReview(review_id) {
  await apiClient.delete(`/admin/reviews/${encodeURIComponent(review_id)}`);
  return true;
}

// ─── Brands ───────────────────────────────────────────────────────────────────
const normalizeBrand = (item) => ({
  id: item?.brand_id ?? item?.id,
  brand_id: item?.brand_id ?? item?.id,
  brand_name: item?.brand_name ?? item?.name ?? "",
  logo_path: item?.logo_path ?? item?.logo ?? item?.logo_url ?? "",
});

export async function getAdminBrands() {
  const res = await apiClient.get("/brands");
  return normalizeList(res).map(normalizeBrand);
}

export async function createAdminBrand({ brand_name, logo_path }) {
  const res = await apiClient.post("/brands", { brand_name, logo_path });
  return res?.data || null;
}

export async function updateAdminBrand(brand_id, { brand_name, logo_path }) {
  const res = await apiClient.put(`/brands/${encodeURIComponent(brand_id)}`, { brand_name, logo_path });
  return res?.data || null;
}

export async function deleteAdminBrand(brand_id) {
  await apiClient.delete(`/brands/${encodeURIComponent(brand_id)}`);
  return true;
}
