export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export class ApiError extends Error {
  constructor(message, status, validationErrors = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.validationErrors = validationErrors;
  }
}

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data?.message || "Request failed. Please try again.",
      response.status,
      data?.validationErrors || null
    );
  }

  return data;
}
