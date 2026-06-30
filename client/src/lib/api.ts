const BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(options?.headers as Record<string, string> || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${url}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, data?: any) => request<T>(url, { method: "POST", body: JSON.stringify(data) }),
  put: <T>(url: string, data?: any) => request<T>(url, { method: "PUT", body: JSON.stringify(data) }),
  del: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};

// Types
export interface Product {
  id: number; name: string; scent: string; pack: string; price: number;
  originalPrice?: number; image: string; images: string[]; description: string;
  inStock: boolean; isFeatured: boolean; badge?: string; sortOrder?: number;
}

export interface User {
  id: number; name: string; email: string; phone: string | null; role: string;
}

export interface AuthResponse { user: User; token: string; }

export interface CartItem {
  id: number; productId: number; productName: string; scent: string;
  pack: string; quantity: number; price: number; image: string;
}

export interface OrderItem {
  id: number; productId: number; productName: string; quantity: number; price: number; image: string;
}

export interface Order {
  id: number; userId: number | null; customerName: string; customerEmail: string;
  customerPhone: string; address: string; city: string; note: string | null;
  status: string; totalAmount: number; items: OrderItem[]; createdAt: string;
}

export interface KolVideo {
  id: number; name: string; channel: string; followers: string;
  videoUrl: string; thumbnailUrl: string; quote: string; sortOrder: number;
}
