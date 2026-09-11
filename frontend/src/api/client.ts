import { authStore } from "@/auth/authStore";
import type { ApiErrorBody } from "@/types/dto";
import { API_URL } from "./config";

/** Error lanzado por `request()` para cualquier respuesta HTTP no exitosa. */
export class ApiError extends Error {
  readonly status: number;
  readonly errores?: Record<string, string>;

  constructor(status: number, mensaje: string, errores?: Record<string, string>) {
    super(mensaje);
    this.name = "ApiError";
    this.status = status;
    this.errores = errores;
  }
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** Parámetros de query string; los valores undefined/null se omiten. */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Si es false, no se envía el header Authorization ni se intenta refrescar el token en un 401. */
  auth?: boolean;
}

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  let url = `${API_URL}${path}`;
  if (params) {
    const query = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join("&");
    if (query) url += `?${query}`;
  }
  return url;
}

async function rawRequest(path: string, options: RequestOptions): Promise<Response> {
  const { method = "GET", body, params, auth = true } = options;
  const headers: Record<string, string> = { Accept: "application/json" };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = authStore.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return fetch(buildUrl(path, params), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return undefined;
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

/**
 * Llama a la API y devuelve el cuerpo ya tipado. Ante un 401 con `auth: true`
 * (por defecto), intenta renovar el access token una vez y repite la petición
 * antes de darse por vencido.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await rawRequest(path, options);

  if (response.status === 401 && options.auth !== false) {
    const refreshed = await authStore.refreshAccessToken();
    if (refreshed) {
      response = await rawRequest(path, options);
    }
  }

  const data = await parseBody(response);

  if (!response.ok) {
    const errorBody = data as Partial<ApiErrorBody> | undefined;
    throw new ApiError(
      response.status,
      errorBody?.mensaje ?? "Ha ocurrido un error inesperado",
      errorBody?.errores
    );
  }

  return data as T;
}
