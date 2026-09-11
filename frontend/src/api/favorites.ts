import type { FavoriteRequest, FavoriteResponse } from "@/types/dto";
import { request } from "./client";

/** Favoritos del usuario autenticado. */
export function findMine(): Promise<FavoriteResponse[]> {
  return request<FavoriteResponse[]>("/api/favorites/me");
}

export function findById(id: number): Promise<FavoriteResponse> {
  return request<FavoriteResponse>(`/api/favorites/${id}`);
}

/** El userId se ignora en el servidor: siempre se crea para el usuario autenticado. */
export function create(data: FavoriteRequest): Promise<FavoriteResponse> {
  return request<FavoriteResponse>("/api/favorites", { method: "POST", body: data });
}

export function remove(id: number): Promise<void> {
  return request<void>(`/api/favorites/${id}`, { method: "DELETE" });
}
