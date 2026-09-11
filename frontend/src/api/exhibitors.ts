import type { ExhibitorRequest, ExhibitorResponse, PageParams, PageResponse } from "@/types/dto";
import { request } from "./client";

export function findAll(params?: PageParams): Promise<PageResponse<ExhibitorResponse>> {
  return request<PageResponse<ExhibitorResponse>>("/api/exhibitors", { params });
}

export function findById(id: number): Promise<ExhibitorResponse> {
  return request<ExhibitorResponse>(`/api/exhibitors/${id}`);
}

export function findByMarketId(marketId: number): Promise<ExhibitorResponse[]> {
  return request<ExhibitorResponse[]>(`/api/exhibitors/market/${marketId}`);
}

/** Solo ADMIN. */
export function create(data: ExhibitorRequest): Promise<ExhibitorResponse> {
  return request<ExhibitorResponse>("/api/exhibitors", { method: "POST", body: data });
}

/** Solo ADMIN. */
export function update(id: number, data: ExhibitorRequest): Promise<ExhibitorResponse> {
  return request<ExhibitorResponse>(`/api/exhibitors/${id}`, { method: "PUT", body: data });
}

/** Solo ADMIN. */
export function remove(id: number): Promise<void> {
  return request<void>(`/api/exhibitors/${id}`, { method: "DELETE" });
}
