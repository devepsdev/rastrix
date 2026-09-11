import type { CategoryRequest, CategoryResponse } from "@/types/dto";
import { request } from "./client";

export function findAll(): Promise<CategoryResponse[]> {
  return request<CategoryResponse[]>("/api/categories");
}

export function findById(id: number): Promise<CategoryResponse> {
  return request<CategoryResponse>(`/api/categories/${id}`);
}

export function findByUuid(uuid: string): Promise<CategoryResponse> {
  return request<CategoryResponse>(`/api/categories/uuid/${uuid}`);
}

/** Solo ADMIN. */
export function create(data: CategoryRequest): Promise<CategoryResponse> {
  return request<CategoryResponse>("/api/categories", { method: "POST", body: data });
}

/** Solo ADMIN. */
export function update(id: number, data: CategoryRequest): Promise<CategoryResponse> {
  return request<CategoryResponse>(`/api/categories/${id}`, { method: "PUT", body: data });
}

/** Solo ADMIN. */
export function remove(id: number): Promise<void> {
  return request<void>(`/api/categories/${id}`, { method: "DELETE" });
}
