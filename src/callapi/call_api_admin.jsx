import axios from "axios";

function resolveApiBaseUrl() {
  const isLocalhostHost =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (isLocalhostHost) return "";

  const raw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";
  return String(raw).replace(/\/+$/, "");
}

const API_BASE_URL = resolveApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auramatch:token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  const body = res?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  return [];
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
  const endpoints = ["/users", "/api/users", "/admin/users", "/user", "/api/user"];

  let firstSuccessfulList = null;

  for (const url of endpoints) {
    try {
      const res = await apiClient.get(url);
      const list = normalizeList(res);
      if (list.length > 0) {
        return list.map(normalizeUser);
      }
      if (firstSuccessfulList === null) {
        firstSuccessfulList = list;
      }
    } catch (err) {
      if (err?.response?.status === 404) continue;
      throw err;
    }
  }

  return (firstSuccessfulList || []).map(normalizeUser);
}

export async function createAdminUser(payload) {
  const res = await requestWithFallback([
    { method: "post", url: "/users", data: payload },
    { method: "post", url: "/api/users", data: payload },
    { method: "post", url: "/admin/users", data: payload },
  ]);
  return normalizeUser(normalizeItem(res) || res?.data || {});
}

export async function updateAdminUser(user_id, payload) {
  const encoded = encodeURIComponent(user_id);
  const res = await requestWithFallback([
    { method: "put", url: `/users/${encoded}`, data: payload },
    { method: "patch", url: `/users/${encoded}`, data: payload },
    { method: "put", url: `/api/users/${encoded}`, data: payload },
    { method: "patch", url: `/api/users/${encoded}`, data: payload },
    { method: "put", url: `/admin/users/${encoded}`, data: payload },
    { method: "patch", url: `/admin/users/${encoded}`, data: payload },
  ]);
  return normalizeUser(normalizeItem(res) || res?.data || {});
}

export async function deleteAdminUser(user_id) {
  const encoded = encodeURIComponent(user_id);
  await requestWithFallback([
    { method: "delete", url: `/users/${encoded}` },
    { method: "delete", url: `/api/users/${encoded}` },
    { method: "delete", url: `/admin/users/${encoded}` },
  ]);
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
  const res = await requestWithFallback([
    { method: "post", url: "/admin/promotions", data },
    { method: "post", url: "/promotions", data },
    { method: "post", url: "/promotion", data },
  ]);
  return normalizePromotion(normalizeItem(res) || res?.data || {});
}

export async function updateAdminPromotion(promotion_id, payload) {
  const encoded = encodeURIComponent(promotion_id);
  const data = toPromotionPayload(payload);
  const res = await requestWithFallback([
    { method: "put", url: `/admin/promotions/${encoded}`, data },
    { method: "patch", url: `/admin/promotions/${encoded}`, data },
    { method: "put", url: `/promotions/${encoded}`, data },
    { method: "patch", url: `/promotions/${encoded}`, data },
    { method: "put", url: `/promotion/${encoded}`, data },
    { method: "patch", url: `/promotion/${encoded}`, data },
  ]);
  return normalizePromotion(normalizeItem(res) || res?.data || {});
}

export async function deleteAdminPromotion(promotion_id) {
  const encoded = encodeURIComponent(promotion_id);
  await requestWithFallback([
    { method: "delete", url: `/admin/promotions/${encoded}` },
    { method: "delete", url: `/promotions/${encoded}` },
    { method: "delete", url: `/promotion/${encoded}` },
  ]);
  return true;
}
