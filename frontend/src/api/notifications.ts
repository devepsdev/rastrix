import type { NotificationRequest, NotificationResponse } from "@/types/dto";
import { request } from "./client";

export function findMine(): Promise<NotificationResponse[]> {
  return request<NotificationResponse[]>("/api/notifications/me");
}

export function findMyUnread(): Promise<NotificationResponse[]> {
  return request<NotificationResponse[]>("/api/notifications/me/unread");
}

/** Solo ADMIN. */
export function create(data: NotificationRequest): Promise<NotificationResponse> {
  return request<NotificationResponse>("/api/notifications", { method: "POST", body: data });
}

export function markAsRead(id: number): Promise<NotificationResponse> {
  return request<NotificationResponse>(`/api/notifications/${id}/read`, { method: "PUT" });
}

export function remove(id: number): Promise<void> {
  return request<void>(`/api/notifications/${id}`, { method: "DELETE" });
}
