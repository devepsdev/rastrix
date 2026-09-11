import type { MarketCategoryRequest, MarketCategoryResponse } from "@/types/dto";
import { request } from "./client";

export function findById(id: number): Promise<MarketCategoryResponse> {
  return request<MarketCategoryResponse>(`/api/market-categories/${id}`);
}

export function findByMarketId(marketId: number): Promise<MarketCategoryResponse[]> {
  return request<MarketCategoryResponse[]>(`/api/market-categories/market/${marketId}`);
}

export function findByCategoryId(categoryId: number): Promise<MarketCategoryResponse[]> {
  return request<MarketCategoryResponse[]>(`/api/market-categories/category/${categoryId}`);
}

/** Solo ADMIN. */
export function create(data: MarketCategoryRequest): Promise<MarketCategoryResponse> {
  return request<MarketCategoryResponse>("/api/market-categories", { method: "POST", body: data });
}

/** Solo ADMIN. */
export function remove(id: number): Promise<void> {
  return request<void>(`/api/market-categories/${id}`, { method: "DELETE" });
}
