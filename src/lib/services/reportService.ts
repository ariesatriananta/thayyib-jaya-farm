import type { 
  DashboardSummary, 
  KandangStatus, 
  DailyMetrics, 
  RankingEntry,
  ReportFilters 
} from '../mock/types';
import { fetchJson } from './apiClient';

export const reportService = {
  async getDashboardSummary(date?: string): Promise<DashboardSummary> {
    const params = date ? `?date=${encodeURIComponent(date)}` : '';
    return fetchJson<DashboardSummary>(`/api/reports/summary${params}`);
  },

  async getKandangStatuses(date?: string): Promise<KandangStatus[]> {
    const params = date ? `?date=${encodeURIComponent(date)}` : '';
    return fetchJson<KandangStatus[]>(`/api/reports/statuses${params}`);
  },

  async getTopPerformers(date?: string, limit: number = 3): Promise<KandangStatus[]> {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    params.set('limit', limit.toString());
    return fetchJson<KandangStatus[]>(`/api/reports/top?${params.toString()}`);
  },

  async getBottomPerformers(date?: string, limit: number = 3): Promise<KandangStatus[]> {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    params.set('limit', limit.toString());
    return fetchJson<KandangStatus[]>(`/api/reports/bottom?${params.toString()}`);
  },

  async getReportData(filters: ReportFilters): Promise<{
    dailyMetrics: DailyMetrics[];
    trendData: { date: string; eggsKg: number; feedUsedKg: number; hdpPercent: number }[];
    ranking: RankingEntry[];
  }> {
    const params = new URLSearchParams({
      startDate: filters.startDate,
      endDate: filters.endDate,
      kandangId: filters.kandangId,
    });
    return fetchJson<{
      dailyMetrics: DailyMetrics[];
      trendData: { date: string; eggsKg: number; feedUsedKg: number; hdpPercent: number }[];
      ranking: RankingEntry[];
    }>(`/api/reports?${params.toString()}`);
  },
};
