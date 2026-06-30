import type { 
  DashboardSummary, 
  KandangStatus, 
  DailyMetrics, 
  RankingEntry,
  ReportFilters 
} from '../mock/types';
import { fetchJson } from './apiClient';

export type FeedCostBasis = 'feedIn' | 'feedUsed';

export const reportService = {
  async getDashboardSummary(
    startDate?: string,
    endDate?: string,
    kandangIds?: string[],
    feedCostBasis: FeedCostBasis = 'feedIn'
  ): Promise<DashboardSummary> {
    const params = new URLSearchParams();
    if (startDate && endDate) {
      params.set('startDate', startDate);
      params.set('endDate', endDate);
    } else if (startDate) {
      params.set('date', startDate);
    }
    if (kandangIds && kandangIds.length > 0) params.set('kandangIds', kandangIds.join(','));
    params.set('feedCostBasis', feedCostBasis);
    const query = params.toString();
    return fetchJson<DashboardSummary>(`/api/reports/summary${query ? `?${query}` : ''}`);
  },

  async getKandangStatuses(
    startDate?: string,
    endDate?: string,
    kandangIds?: string[],
    feedCostBasis: FeedCostBasis = 'feedIn'
  ): Promise<KandangStatus[]> {
    const params = new URLSearchParams();
    if (startDate && endDate) {
      params.set('startDate', startDate);
      params.set('endDate', endDate);
    } else if (startDate) {
      params.set('date', startDate);
    }
    if (kandangIds && kandangIds.length > 0) params.set('kandangIds', kandangIds.join(','));
    params.set('feedCostBasis', feedCostBasis);
    const query = params.toString();
    return fetchJson<KandangStatus[]>(`/api/reports/statuses${query ? `?${query}` : ''}`);
  },

  async getTopPerformers(
    startDate?: string,
    endDate?: string,
    limit: number = 3,
    kandangIds?: string[],
    feedCostBasis: FeedCostBasis = 'feedIn'
  ): Promise<KandangStatus[]> {
    const params = new URLSearchParams();
    if (startDate && endDate) {
      params.set('startDate', startDate);
      params.set('endDate', endDate);
    } else if (startDate) {
      params.set('date', startDate);
    }
    params.set('limit', limit.toString());
    if (kandangIds && kandangIds.length > 0) params.set('kandangIds', kandangIds.join(','));
    params.set('feedCostBasis', feedCostBasis);
    return fetchJson<KandangStatus[]>(`/api/reports/top?${params.toString()}`);
  },

  async getBottomPerformers(
    startDate?: string,
    endDate?: string,
    limit: number = 3,
    kandangIds?: string[],
    feedCostBasis: FeedCostBasis = 'feedIn'
  ): Promise<KandangStatus[]> {
    const params = new URLSearchParams();
    if (startDate && endDate) {
      params.set('startDate', startDate);
      params.set('endDate', endDate);
    } else if (startDate) {
      params.set('date', startDate);
    }
    params.set('limit', limit.toString());
    if (kandangIds && kandangIds.length > 0) params.set('kandangIds', kandangIds.join(','));
    params.set('feedCostBasis', feedCostBasis);
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
      nilaiHpp: number;
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
        nilaiHpp: number;
      }[];
      ranking: RankingEntry[];
    }>(`/api/reports?${params.toString()}`);
  },
};
