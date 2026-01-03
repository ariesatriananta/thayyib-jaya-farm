import { ApiError, apiRequest } from "./client";
import type { Recording } from "@/lib/domain/types";

export type RecordingCreateInput = {
  kandangId: string;
  date: string;
  feedInKg: number;
  feedRemainingKg: number;
  feedUsedKg: number;
  eggsKg: number;
  eggsCount: number;
  deadChickenCount: number;
  notes: string;
};

export type RecordingUpdateInput = Partial<RecordingCreateInput>;

export function getRecordings(query?: {
  date?: string;
  from?: string;
  to?: string;
  kandangId?: string;
}) {
  return apiRequest<Recording[]>("/recordings", { query });
}

export function getRecordingById(id: string) {
  return apiRequest<Recording | null>(`/recordings/${id}`).catch((err) => {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  });
}

export function createRecording(data: RecordingCreateInput) {
  return apiRequest<Recording>("/recordings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateRecording(id: string, data: RecordingUpdateInput) {
  return apiRequest<Recording>(`/recordings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteRecording(id: string) {
  return apiRequest<Recording>(`/recordings/${id}`, {
    method: "DELETE",
  });
}
