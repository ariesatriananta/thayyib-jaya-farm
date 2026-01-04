import type { Kandang } from '../mock/types';
import { fetchJson } from './apiClient';

export const kandangService = {
  async getAll(): Promise<Kandang[]> {
    return fetchJson<Kandang[]>('/api/kandang');
  },

  async getActive(): Promise<Kandang[]> {
    return fetchJson<Kandang[]>('/api/kandang/active');
  },

  async getById(id: string): Promise<Kandang | null> {
    return fetchJson<Kandang | null>(`/api/kandang/${id}`);
  },

  create(data: {
    name: string;
    initialChickenCount: number;
    targetHDPPercent: number;
    targetFCR: number;
    status: 'active' | 'inactive';
  }): Promise<Kandang> {
    return fetchJson<Kandang>('/api/kandang', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: Partial<Kandang>): Promise<Kandang | null> {
    return fetchJson<Kandang | null>(`/api/kandang/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(id: string): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>(`/api/kandang/${id}`, {
      method: 'DELETE',
    });
  },

  toggleStatus(id: string): Promise<Kandang | null> {
    return fetchJson<Kandang | null>(`/api/kandang/${id}/toggle`, {
      method: 'POST',
    });
  },
};
