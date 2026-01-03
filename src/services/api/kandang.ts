import { apiRequest } from "./client";
import type { Kandang } from "@/lib/domain/types";

export type KandangCreateInput = {
  name: string;
  initialChickenCount: number;
  targetHDPPercent: number;
  targetFCR: number;
  status: "active" | "inactive";
};

export type KandangUpdateInput = Partial<KandangCreateInput>;

export function getKandangAll() {
  return apiRequest<Kandang[]>("/kandang");
}

export function getKandangById(id: string) {
  return apiRequest<Kandang | null>(`/kandang/${id}`);
}

export function createKandang(data: KandangCreateInput) {
  return apiRequest<Kandang>("/kandang", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateKandang(id: string, data: KandangUpdateInput) {
  return apiRequest<Kandang>(`/kandang/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteKandang(id: string) {
  return apiRequest<Kandang>(`/kandang/${id}`, {
    method: "DELETE",
  });
}
