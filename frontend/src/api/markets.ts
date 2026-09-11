import type { MarketRequest, MarketResponse, PageParams, PageResponse } from "@/types/dto";
import { request } from "./client";

export function findAll(params?: PageParams): Promise<PageResponse<MarketResponse>> {
  return request<PageResponse<MarketResponse>>("/api/markets", { params });
}

export function findById(id: number): Promise<MarketResponse> {
  return request<MarketResponse>(`/api/markets/${id}`);
}

export function findByUuid(uuid: string): Promise<MarketResponse> {
  return request<MarketResponse>(`/api/markets/uuid/${uuid}`);
}

export function findByCity(city: string, params?: PageParams): Promise<PageResponse<MarketResponse>> {
  return request<PageResponse<MarketResponse>>(`/api/markets/city/${encodeURIComponent(city)}`, { params });
}

export function findByProvince(
  province: string,
  params?: PageParams
): Promise<PageResponse<MarketResponse>> {
  return request<PageResponse<MarketResponse>>(`/api/markets/province/${encodeURIComponent(province)}`, {
    params,
  });
}

/** Solo ADMIN. */
export function create(data: MarketRequest): Promise<MarketResponse> {
  return request<MarketResponse>("/api/markets", { method: "POST", body: data });
}

/** Solo ADMIN. */
export function update(id: number, data: MarketRequest): Promise<MarketResponse> {
  return request<MarketResponse>(`/api/markets/${id}`, { method: "PUT", body: data });
}

/** Solo ADMIN. */
export function remove(id: number): Promise<void> {
  return request<void>(`/api/markets/${id}`, { method: "DELETE" });
}
