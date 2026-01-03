import { apiRequest } from "./client";
import type { Settings } from "@/lib/domain/types";

export type SettingsCreateInput = {
  farmName: string;
  defaultTargetHDPPercent: number;
  defaultTargetFCR: number;
};

export type SettingsUpdateInput = Partial<SettingsCreateInput>;

export function getSettingsAll() {
  return apiRequest<Settings[]>("/settings");
}

export function getSettingsById(id: string) {
  return apiRequest<Settings | null>(`/settings/${id}`);
}

export function createSettings(data: SettingsCreateInput) {
  return apiRequest<Settings>("/settings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateSettings(id: string, data: SettingsUpdateInput) {
  return apiRequest<Settings>(`/settings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteSettings(id: string) {
  return apiRequest<Settings>(`/settings/${id}`, {
    method: "DELETE",
  });
}
