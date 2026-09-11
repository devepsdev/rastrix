import type { MarketImageRequest, MarketImageResponse } from "@/types/dto";
import { request } from "./client";

export function findById(id: number): Promise<MarketImageResponse> {
  return request<MarketImageResponse>(`/api/market-images/${id}`);
}

export function findByMarketId(marketId: number): Promise<MarketImageResponse[]> {
  return request<MarketImageResponse[]>(`/api/market-images/market/${marketId}`);
}

/** Solo ADMIN. */
export function create(data: MarketImageRequest): Promise<MarketImageResponse> {
  return request<MarketImageResponse>("/api/market-images", { method: "POST", body: data });
}

/** Solo ADMIN. */
export function update(id: number, data: MarketImageRequest): Promise<MarketImageResponse> {
  return request<MarketImageResponse>(`/api/market-images/${id}`, { method: "PUT", body: data });
}

/** Solo ADMIN. */
export function remove(id: number): Promise<void> {
  return request<void>(`/api/market-images/${id}`, { method: "DELETE" });
}
