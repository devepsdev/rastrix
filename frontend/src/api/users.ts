import type {
  ChangePasswordRequest,
  PageParams,
  PageResponse,
  Role,
  UpdateProfileRequest,
  UserResponse,
} from "@/types/dto";
import { request } from "./client";

export function getMyProfile(): Promise<UserResponse> {
  return request<UserResponse>("/api/users/me");
}

export function updateMyProfile(data: UpdateProfileRequest): Promise<UserResponse> {
  return request<UserResponse>("/api/users/me", { method: "PUT", body: data });
}

export function changeMyPassword(data: ChangePasswordRequest): Promise<void> {
  return request<void>("/api/users/me/password", { method: "PUT", body: data });
}

export function deleteMyAccount(): Promise<void> {
  return request<void>("/api/users/me", { method: "DELETE" });
}

// --- Solo ADMIN ---

export function findAll(params?: PageParams): Promise<PageResponse<UserResponse>> {
  return request<PageResponse<UserResponse>>("/api/users", { params });
}

export function findById(id: number): Promise<UserResponse> {
  return request<UserResponse>(`/api/users/${id}`);
}

export function updateRole(id: number, role: Role): Promise<UserResponse> {
  return request<UserResponse>(`/api/users/${id}/role`, { method: "PUT", body: { role } });
}

export function remove(id: number): Promise<void> {
  return request<void>(`/api/users/${id}`, { method: "DELETE" });
}
