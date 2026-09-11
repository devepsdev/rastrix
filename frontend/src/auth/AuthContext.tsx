import * as authApi from "@/api/auth";
import { ApiError } from "@/api/client";
import * as usersApi from "@/api/users";
import type { LoginRequest, UserRequest, UserResponse } from "@/types/dto";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { authStore } from "./authStore";

interface AuthContextValue {
  /** Perfil del usuario autenticado, o null si no ha iniciado sesión o aún se está comprobando. */
  user: UserResponse | null;
  isAuthenticated: boolean;
  /** true mientras se comprueba si hay una sesión guardada al arrancar la app. */
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: UserRequest) => Promise<void>;
  logout: () => Promise<void>;
  /** Vuelve a pedir /api/users/me, útil tras editar el perfil desde otra pantalla. */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(authStore.subscribe, authStore.getState, authStore.getState);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await usersApi.getMyProfile();
      authStore.setUser(profile);
    } catch (error) {
      // Si el token ya no es válido (p.ej. contraseña cambiada en otro dispositivo), cerramos sesión.
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        await authStore.clearSession();
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await authStore.bootstrap();
      if (authStore.getState().refreshToken) {
        const refreshed = await authStore.refreshAccessToken();
        if (refreshed && !cancelled) {
          await loadProfile();
        }
      }
      if (!cancelled) setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadProfile]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const auth = await authApi.login(credentials);
      await authStore.setTokens(auth.accessToken, auth.refreshToken);
      await loadProfile();
    },
    [loadProfile]
  );

  const register = useCallback(
    async (data: UserRequest) => {
      const auth = await authApi.register(data);
      await authStore.setTokens(auth.accessToken, auth.refreshToken);
      await loadProfile();
    },
    [loadProfile]
  );

  const logout = useCallback(async () => {
    const { refreshToken } = authStore.getState();
    await authStore.clearSession();
    if (refreshToken) {
      // Best-effort: si falla (sin conexión, token ya caducado) la sesión local ya está cerrada igualmente.
      authApi.logout({ refreshToken }).catch(() => {});
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      isAuthenticated: state.user !== null,
      isLoading,
      login,
      register,
      logout,
      refreshProfile: loadProfile,
    }),
    [state.user, isLoading, login, register, logout, loadProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
  return context;
}
