const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!configuredApiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is not configured");
}

export const API_BASE_URL = configuredApiBaseUrl.replace(/\/$/, "");

export function getAuthToken(): string | null {
  return localStorage.getItem("ela_access_token");
}

export function setAuthToken(token: string): void {
  localStorage.setItem("ela_access_token", token);
}

export function clearAuthToken(): void {
  localStorage.removeItem("ela_access_token");
}

export async function apiFetch<T>(path: string, options: RequestInit = {}, tokenOverride?: string): Promise<T> {
  const token = tokenOverride ?? getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload && typeof payload === "object" && "detail" in payload
      ? (payload as { detail?: string }).detail || "Request failed"
      : "Request failed";
    throw new Error(message);
  }

  return payload as T;
}
