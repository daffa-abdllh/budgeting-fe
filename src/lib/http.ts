import type { ApiResponse } from "./api.contract";

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  json?: unknown;
}

export class HttpError extends Error {
  status: number;
  info: unknown;

  constructor(message: string, status: number, info?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.info = info;
  }
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { params, json, headers, ...restOptions } = options;

  // 1. Build URL with query parameters
  const urlString = path.startsWith("http") ? path : `${BACKEND_URL}${path}`;
  const url = new URL(urlString);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // 2. Build Headers
  const defaultHeaders = new Headers(headers);
  if (json !== undefined && !defaultHeaders.has("Content-Type")) {
    defaultHeaders.set("Content-Type", "application/json");
  }

  // 3. Setup body
  const body = json !== undefined ? JSON.stringify(json) : options.body;

  // 4. Request execution
  const response = await fetch(url.toString(), {
    ...restOptions,
    headers: defaultHeaders,
    body,
    credentials: "include", // Required for HTTP-only cookies
  });

  // 5. Response handling (empty / no-content 204)
  if (response.status === 204) {
    return { status: "success", data: null as unknown as T } as ApiResponse<T>;
  }

  let data: unknown;
  const contentType = response.headers.get("Content-Type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : {};
  }

  if (!response.ok) {
    const responseData = data as Record<string, unknown> | undefined;
    const errorMessage = (responseData?.message as string | undefined) || `HTTP error! Status: ${response.status}`;
    throw new HttpError(errorMessage, response.status, data);
  }

  return data as ApiResponse<T>;
}
// Helper method to extract validation errors from field errors response
export function getFieldErrors(error: unknown): Record<string, string[]> | undefined {
  if (error instanceof HttpError) {
    const info = error.info as Record<string, unknown> | undefined;
    return info?.errors as Record<string, string[]> | undefined;
  }
  return undefined;
}
