import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  ResetPasswordRequest,
  UserRequest,
} from "@/types/dto";
import { request } from "./client";

export function register(data: UserRequest): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/register", { method: "POST", body: data, auth: false });
}

export function login(data: LoginRequest): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/login", { method: "POST", body: data, auth: false });
}

export function refresh(data: RefreshTokenRequest): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/refresh", { method: "POST", body: data, auth: false });
}

export function logout(data: RefreshTokenRequest): Promise<void> {
  return request<void>("/api/auth/logout", { method: "POST", body: data, auth: false });
}

export function forgotPassword(data: ForgotPasswordRequest): Promise<void> {
  return request<void>("/api/auth/forgot-password", { method: "POST", body: data, auth: false });
}

export function resetPassword(data: ResetPasswordRequest): Promise<void> {
  return request<void>("/api/auth/reset-password", { method: "POST", body: data, auth: false });
}
