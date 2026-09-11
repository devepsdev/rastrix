import { API_URL } from "@/api/config";
import type { AuthResponse, UserResponse } from "@/types/dto";
import * as tokenStorage from "./tokenStorage";

const ACCESS_TOKEN_KEY = "rastrix.accessToken";
const REFRESH_TOKEN_KEY = "rastrix.refreshToken";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserResponse | null;
}

type Listener = () => void;

let state: AuthState = { accessToken: null, refreshToken: null, user: null };
const listeners = new Set<Listener>();

function notify(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getState(): AuthState {
  return state;
}

function getAccessToken(): string | null {
  return state.accessToken;
}

/** Carga los tokens persistidos al arrancar la app. No hace ninguna llamada de red. */
async function bootstrap(): Promise<void> {
  const [accessToken, refreshToken] = await Promise.all([
    tokenStorage.getItem(ACCESS_TOKEN_KEY),
    tokenStorage.getItem(REFRESH_TOKEN_KEY),
  ]);
  state = { ...state, accessToken, refreshToken };
  notify();
}

async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  state = { ...state, accessToken, refreshToken };
  notify();
  await Promise.all([
    tokenStorage.setItem(ACCESS_TOKEN_KEY, accessToken),
    tokenStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

function setUser(user: UserResponse | null): void {
  state = { ...state, user };
  notify();
}

async function clearSession(): Promise<void> {
  state = { accessToken: null, refreshToken: null, user: null };
  notify();
  await Promise.all([
    tokenStorage.deleteItem(ACCESS_TOKEN_KEY),
    tokenStorage.deleteItem(REFRESH_TOKEN_KEY),
  ]);
}

let refreshPromise: Promise<boolean> | null = null;

/**
 * Renueva el access token usando el refresh token guardado.
 * Varias llamadas simultáneas (p.ej. varias peticiones en paralelo que reciben
 * un 401 a la vez) comparten la misma renovación en curso en vez de disparar
 * varios /api/auth/refresh, ya que el backend rota el refresh token en cada uso
 * y el segundo request lo dejaría inválido.
 */
async function refreshAccessToken(): Promise<boolean> {
  const currentRefreshToken = state.refreshToken;
  if (!currentRefreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = doRefresh(currentRefreshToken).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function doRefresh(refreshToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) {
      await clearSession();
      return false;
    }
    const data = (await response.json()) as AuthResponse;
    await setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    // Fallo de red: no cerramos sesión, puede que solo no haya conexión ahora mismo.
    return false;
  }
}

export const authStore = {
  subscribe,
  getState,
  getAccessToken,
  bootstrap,
  setTokens,
  setUser,
  clearSession,
  refreshAccessToken,
};
