import type { RatingRequest, RatingResponse } from "@/types/dto";
import { request } from "./client";

export function findById(id: number): Promise<RatingResponse> {
  return request<RatingResponse>(`/api/ratings/${id}`);
}

export function findByMarketId(marketId: number): Promise<RatingResponse[]> {
  return request<RatingResponse[]>(`/api/ratings/market/${marketId}`);
}

/** El userId se ignora en el servidor: siempre se crea para el usuario autenticado. */
export function create(data: RatingRequest): Promise<RatingResponse> {
  return request<RatingResponse>("/api/ratings", { method: "POST", body: data });
}

/** Solo el autor de la valoración (o un ADMIN) puede actualizarla. */
export function update(id: number, data: RatingRequest): Promise<RatingResponse> {
  return request<RatingResponse>(`/api/ratings/${id}`, { method: "PUT", body: data });
}

export function remove(id: number): Promise<void> {
  return request<void>(`/api/ratings/${id}`, { method: "DELETE" });
}
