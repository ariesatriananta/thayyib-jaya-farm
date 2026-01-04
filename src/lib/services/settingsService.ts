import type { Settings } from '../mock/types';
import { fetchJson } from './apiClient';

export const settingsService = {
  async get(): Promise<Settings> {
    return fetchJson<Settings>('/api/settings');
  },

  async update(data: Partial<Settings>): Promise<Settings> {
    return fetchJson<Settings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async resetData(): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>('/api/settings/reset', {
      method: 'POST',
    });
  },
};
