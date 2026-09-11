import type { StatsResponse } from "@/types/dto";
import { request } from "./client";

/** Solo ADMIN. */
export function getStats(): Promise<StatsResponse> {
  return request<StatsResponse>("/api/admin/stats");
}
