import type { 
  DashboardSummary, 
  KandangStatus, 
  DailyMetrics, 
  RankingEntry,
  ReportFilters 
} from '../mock/types';
import { fetchJson } from './apiClient';

export const reportService = {
  async getDashboardSummary(date?: string, kandangIds?: string[]): Promise<DashboardSummary> {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (kandangIds && kandangIds.length > 0) params.set('kandangIds', kandangIds.join(','));
    const query = params.toString();
    return fetchJson<DashboardSummary>(`/api/reports/summary${query ? `?${query}` : ''}`);
  },

  async getKandangStatuses(date?: string, kandangIds?: string[]): Promise<KandangStatus[]> {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (kandangIds && kandangIds.length > 0) params.set('kandangIds', kandangIds.join(','));
    const query = params.toString();
    return fetchJson<KandangStatus[]>(`/api/reports/statuses${query ? `?${query}` : ''}`);
  },

  async getTopPerformers(date?: string, limit: number = 3, kandangIds?: string[]): Promise<KandangStatus[]> {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    params.set('limit', limit.toString());
    if (kandangIds && kandangIds.length > 0) params.set('kandangIds', kandangIds.join(','));
    return fetchJson<KandangStatus[]>(`/api/reports/top?${params.toString()}`);
  },

  async getBottomPerformers(date?: string, limit: number = 3, kandangIds?: string[]): Promise<KandangStatus[]> {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    params.set('limit', limit.toString());
    if (kandangIds && kandangIds.length > 0) params.set('kandangIds', kandangIds.join(','));
    return fetchJson<KandangStatus[]>(`/api/reports/bottom?${params.toString()}`);
  },

  async getReportData(filters: ReportFilters): Promise<{
    dailyMetrics: DailyMetrics[];
    trendData: {
      date: string;
      eggsKg: number;
      feedInKg: number;
      feedUsedKg: number;
      hdpPercent: number;
      feedCost: number;
      eggsRevenue: number;
      hpp: number;
    }[];
    ranking: RankingEntry[];
  }> {
    const params = new URLSearchParams({
      startDate: filters.startDate,
      endDate: filters.endDate,
      kandangId: filters.kandangId ?? "all",
    });
    if (filters.kandangIds !== undefined) {
      params.set("kandangIds", filters.kandangIds.join(","));
    }
    return fetchJson<{
      dailyMetrics: DailyMetrics[];
      trendData: {
        date: string;
        eggsKg: number;
        feedInKg: number;
        feedUsedKg: number;
        hdpPercent: number;
        feedCost: number;
        eggsRevenue: number;
        hpp: number;
      }[];
      ranking: RankingEntry[];
    }>(`/api/reports?${params.toString()}`);
  },
};
