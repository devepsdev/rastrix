import type { SuggestionRequest, SuggestionResponse } from "@/types/dto";
import { request } from "./client";

/** Propone un mercado. Queda pendiente hasta que un administrador lo revise. */
export function create(data: SuggestionRequest): Promise<SuggestionResponse> {
  return request<SuggestionResponse>("/api/suggestions", { method: "POST", body: data });
}

export function findMine(): Promise<SuggestionResponse[]> {
  return request<SuggestionResponse[]>("/api/suggestions/me");
}
