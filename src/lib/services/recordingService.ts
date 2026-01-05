import type { Recording, DailyMetrics } from '../mock/types';
import { fetchJson } from './apiClient';

export interface CreateRecordingInput {
  kandangId: string;
  date: string;
  feedInKg: number;
  feedPriceKg?: number;
  feedRemainingKg: number;
  eggsKg: number;
  eggsPriceKg?: number;
  eggsCount: number;
  deadChickenCount: number;
  notes: string;
}

export const recordingService = {
  async getAll(): Promise<Recording[]> {
    return fetchJson<Recording[]>('/api/recordings');
  },

  async getById(id: string): Promise<Recording | null> {
    return fetchJson<Recording | null>(`/api/recordings/${id}`);
  },

  async getByKandang(kandangId: string): Promise<Recording[]> {
    return fetchJson<Recording[]>(`/api/recordings?kandangId=${encodeURIComponent(kandangId)}`);
  },

  async getByDateRange(startDate: string, endDate: string, kandangId?: string): Promise<Recording[]> {
    const params = new URLSearchParams({ startDate, endDate });
    if (kandangId) params.set('kandangId', kandangId);
    return fetchJson<Recording[]>(`/api/recordings?${params.toString()}`);
  },

  async getByDateAndKandang(date: string, kandangId: string): Promise<Recording | null> {
    const params = new URLSearchParams({ date, kandangId });
    return fetchJson<Recording | null>(`/api/recordings?${params.toString()}`);
  },

  async existsForDateAndKandang(date: string, kandangId: string): Promise<boolean> {
    const record = await this.getByDateAndKandang(date, kandangId);
    return !!record;
  },

  async create(data: CreateRecordingInput): Promise<Recording> {
    return fetchJson<Recording>('/api/recordings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Recording>): Promise<Recording | null> {
    return fetchJson<Recording | null>(`/api/recordings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>(`/api/recordings/${id}`, {
      method: 'DELETE',
    });
  },

  async getMetricsByDateRange(startDate: string, endDate: string, kandangId?: string): Promise<DailyMetrics[]> {
    const params = new URLSearchParams({ startDate, endDate });
    if (kandangId) params.set('kandangId', kandangId);
    return fetchJson<DailyMetrics[]>(`/api/recordings/metrics?${params.toString()}`);
  },

  async getLatestDate(kandangIds?: string[]): Promise<string | null> {
    const params = new URLSearchParams();
    if (kandangIds && kandangIds.length > 0) {
      params.set("kandangIds", kandangIds.join(","));
    }
    const url = params.toString()
      ? `/api/recordings/latest-date?${params.toString()}`
      : "/api/recordings/latest-date";
    const response = await fetchJson<{ date: string | null }>(url);
    return response.date;
  },
};
