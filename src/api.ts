const API_BASE =
  (window as Window & { __BIGSUP_API_BASE__?: string }).__BIGSUP_API_BASE__ ||
  import.meta.env.VITE_API_BASE ||
  "";

export type Operator = {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  role_label: string;
  login_key: string;
  created_at: string;
};

const tokenKey = "bigsup_admin_token";

export function getToken(): string | null {
  return localStorage.getItem(tokenKey);
}

export function setToken(token: string) {
  localStorage.setItem(tokenKey, token);
}

export function clearToken() {
  localStorage.removeItem(tokenKey);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function adminLogin(password: string) {
  const data = await request<{ token: string }>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
  setToken(data.token);
}

export function listOperators() {
  return request<Operator[]>("/api/admin/operators");
}

export function createOperator(body: {
  first_name: string;
  last_name: string;
  role: string;
}) {
  return request<Operator>("/api/admin/operators", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function deleteOperator(id: string) {
  return request<{ ok: boolean }>(`/api/admin/operators/${id}`, {
    method: "DELETE",
  });
}
