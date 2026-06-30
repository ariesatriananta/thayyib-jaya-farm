import { format } from "date-fns";
import type {
  DashboardSummary,
  KandangStatus,
  DailyMetrics,
  RankingEntry,
  ReportFilters,
  Kandang,
  Recording,
} from "@/lib/mock/types";
import {
  buildDailyMetrics,
  calculateAverages,
  getDayName,
  getHDPStatus,
  getMonthLabel,
  getTotalChickenToday,
  getWeekNumber,
} from "@/lib/mock/calculations";

type DateRangeFilter = {
  date?: string;
  startDate?: string;
  endDate?: string;
};

export type FeedCostBasis = "feedIn" | "feedUsed";

function getMetricFeedCost(metric: DailyMetrics, feedCostBasis: FeedCostBasis): number {
  if (feedCostBasis === "feedUsed") {
    return metric.feedUsedKg * metric.feedPriceKg;
  }
  return metric.feedCost;
}

function resolveDateRange(filters?: DateRangeFilter): { startDate: string; endDate: string } {
  const today = format(new Date(), "yyyy-MM-dd");
  if (!filters) {
    return { startDate: today, endDate: today };
  }

  if (filters.startDate && filters.endDate) {
    return { startDate: filters.startDate, endDate: filters.endDate };
  }

  const date = filters.date || today;
  return { startDate: date, endDate: date };
}

function buildPeriodMetrics(
  kandang: Kandang,
  metrics: DailyMetrics[],
  allRecordings: Recording[],
  feedCostBasis: FeedCostBasis = "feedIn"
): DailyMetrics | null {
  if (metrics.length === 0) return null;

  const sorted = [...metrics].sort((a, b) => a.date.localeCompare(b.date));
  const lastMetric = sorted[sorted.length - 1];

  const totals = metrics.reduce(
    (acc, metric) => {
      acc.feedInKg += metric.feedInKg;
      acc.feedUsedKg += metric.feedUsedKg;
      acc.feedRemainingKg = metric.feedRemainingKg;
      acc.eggsKg += metric.eggsKg;
      acc.eggsCount += metric.eggsCount;
      acc.whiteEggsKg += metric.whiteEggsKg;
      acc.whiteEggsCount += metric.whiteEggsCount;
      acc.brokenEggsCount += metric.brokenEggsCount;
      acc.deadChickenCount += metric.deadChickenCount;
      acc.feedCost += getMetricFeedCost(metric, feedCostBasis);
      acc.eggsRevenue += metric.eggsRevenue;
      return acc;
    },
    {
      feedInKg: 0,
      feedUsedKg: 0,
      feedRemainingKg: 0,
      eggsKg: 0,
      eggsCount: 0,
      whiteEggsKg: 0,
      whiteEggsCount: 0,
      brokenEggsCount: 0,
      deadChickenCount: 0,
      feedCost: 0,
      eggsRevenue: 0,
    }
  );

  const validFcrs = metrics.filter((m) => m.fcr > 0).map((m) => m.fcr);
  const validHdps = metrics.filter((m) => m.hdpPercent > 0).map((m) => m.hdpPercent);
  const averageFcr = validFcrs.length
    ? Number((validFcrs.reduce((sum, value) => sum + value, 0) / validFcrs.length).toFixed(2))
    : 0;
  const averageHdp = validHdps.length
    ? Number((validHdps.reduce((sum, value) => sum + value, 0) / validHdps.length).toFixed(2))
    : 0;

  const totalChickenToday = getTotalChickenToday(kandang, allRecordings, lastMetric.date);
  const feedPriceKg = totals.feedInKg > 0 ? totals.feedCost / totals.feedInKg : 0;
  const eggsPriceKg = totals.eggsKg > 0 ? totals.eggsRevenue / totals.eggsKg : 0;
  const hpp = totals.eggsRevenue - totals.feedCost;
  const dateObj = new Date(lastMetric.date);

  return {
    date: lastMetric.date,
    recordingId: lastMetric.recordingId,
    kandangId: kandang.id,
    kandangName: kandang.name,
    totalChickenToday,
    feedInKg: Number(totals.feedInKg.toFixed(1)),
    feedPriceKg: Number(feedPriceKg.toFixed(2)),
    feedRemainingKg: Number(totals.feedRemainingKg.toFixed(1)),
    feedUsedKg: Number(totals.feedUsedKg.toFixed(1)),
    eggsKg: Number(totals.eggsKg.toFixed(1)),
    eggsPriceKg: Number(eggsPriceKg.toFixed(2)),
    eggsCount: totals.eggsCount,
    whiteEggsKg: Number(totals.whiteEggsKg.toFixed(1)),
    whiteEggsCount: totals.whiteEggsCount,
    brokenEggsCount: totals.brokenEggsCount,
    deadChickenCount: totals.deadChickenCount,
    feedCost: Number(totals.feedCost.toFixed(2)),
    eggsRevenue: Number(totals.eggsRevenue.toFixed(2)),
    hpp: Number(hpp.toFixed(2)),
    fcr: averageFcr,
    hdpPercent: averageHdp,
    weekNumber: getWeekNumber(dateObj),
    monthLabel: getMonthLabel(dateObj),
    dayName: getDayName(dateObj),
    notes: "",
    createdAt: lastMetric.createdAt,
    updatedAt: lastMetric.updatedAt,
  };
}

export function buildDashboardSummary(
  kandangList: Kandang[],
  allRecordings: Recording[],
  filters?: DateRangeFilter,
  feedCostBasis: FeedCostBasis = "feedIn"
): DashboardSummary {
  const { startDate, endDate } = resolveDateRange(filters);
  const rangeRecordings = allRecordings.filter(
    (r) => r.date >= startDate && r.date <= endDate
  );
  const activeKandang = kandangList.filter((k) => k.status === "active");

  const metrics: DailyMetrics[] = [];
  for (const recording of rangeRecordings) {
    const kandang = kandangList.find((k) => k.id === recording.kandangId);
    if (kandang) {
      metrics.push(buildDailyMetrics(recording, kandang, allRecordings));
    }
  }

  const { averageFCR, averageHDP } = calculateAverages(metrics);
  const totalFeedCost = metrics.reduce((sum, m) => sum + getMetricFeedCost(m, feedCostBasis), 0);
  const totalEggsRevenue = metrics.reduce((sum, m) => sum + m.eggsRevenue, 0);
  const totalHpp = totalEggsRevenue - totalFeedCost;

  return {
    totalEggsKg: Number(metrics.reduce((sum, m) => sum + m.eggsKg, 0).toFixed(1)),
    totalEggsCount: metrics.reduce((sum, m) => sum + m.eggsCount, 0),
    totalWhiteEggsKg: Number(metrics.reduce((sum, m) => sum + m.whiteEggsKg, 0).toFixed(1)),
    totalWhiteEggsCount: metrics.reduce((sum, m) => sum + m.whiteEggsCount, 0),
    totalBrokenEggsCount: metrics.reduce((sum, m) => sum + m.brokenEggsCount, 0),
    totalFeedIn: Number(metrics.reduce((sum, m) => sum + m.feedInKg, 0).toFixed(1)),
    totalFeedUsed: Number(metrics.reduce((sum, m) => sum + m.feedUsedKg, 0).toFixed(1)),
    totalDeadChickens: metrics.reduce((sum, m) => sum + m.deadChickenCount, 0),
    totalEggsRevenue: Number(totalEggsRevenue.toFixed(0)),
    totalFeedCost: Number(totalFeedCost.toFixed(0)),
    totalHpp: Number(totalHpp.toFixed(0)),
    averageFCR,
    averageHDP,
    kandangCount: kandangList.length,
    activeKandangCount: activeKandang.length,
  };
}

export function buildKandangStatuses(
  kandangList: Kandang[],
  allRecordings: Recording[],
  filters?: DateRangeFilter,
  feedCostBasis: FeedCostBasis = "feedIn"
): KandangStatus[] {
  const { startDate, endDate } = resolveDateRange(filters);
  const activeKandang = kandangList.filter((k) => k.status === "active");

  return activeKandang.map((kandang) => {
    const kandangRecordings = allRecordings.filter(
      (r) => r.kandangId === kandang.id && r.date >= startDate && r.date <= endDate
    );

    let todayMetrics: DailyMetrics | null = null;
    let hdpStatus: "excellent" | "good" | "warning" | "danger" = "warning";

    if (kandangRecordings.length > 0) {
      const metrics = kandangRecordings.map((recording) =>
        buildDailyMetrics(recording, kandang, allRecordings)
      );
      todayMetrics = buildPeriodMetrics(kandang, metrics, allRecordings, feedCostBasis);
      if (todayMetrics) {
        hdpStatus = getHDPStatus(todayMetrics.hdpPercent);
      }
    }

    return {
      kandang,
      todayMetrics,
      hdpStatus,
    };
  });
}

export function buildTopPerformers(statuses: KandangStatus[], limit = 3): KandangStatus[] {
  return statuses
    .filter((s) => s.todayMetrics)
    .sort((a, b) => (b.todayMetrics?.hdpPercent || 0) - (a.todayMetrics?.hdpPercent || 0))
    .slice(0, limit);
}

export function buildBottomPerformers(statuses: KandangStatus[], limit = 3): KandangStatus[] {
  return statuses
    .filter((s) => s.todayMetrics)
    .sort((a, b) => (a.todayMetrics?.hdpPercent || 0) - (b.todayMetrics?.hdpPercent || 0))
    .slice(0, limit);
}

export function buildReportData(
  allRecordings: Recording[],
  kandangList: Kandang[],
  filters: ReportFilters
): {
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
} {
  const { startDate, endDate, kandangId } = filters;
  const recordings = allRecordings.filter(
    (r) => r.date >= startDate && r.date <= endDate
  );

  const filteredRecordings = kandangId === "all"
    ? recordings
    : recordings.filter((r) => r.kandangId === kandangId);

  const dailyMetrics: DailyMetrics[] = [];
  for (const recording of filteredRecordings) {
    const kandang = kandangList.find((k) => k.id === recording.kandangId);
    if (kandang) {
      dailyMetrics.push(buildDailyMetrics(recording, kandang, allRecordings));
    }
  }

  const dateMap = new Map<string, {
    eggsKg: number;
    feedInKg: number;
    feedUsedKg: number;
    hdpPercents: number[];
    feedCost: number;
    eggsRevenue: number;
    eggsCount: number;
  }>();
  for (const metric of dailyMetrics) {
    const existing = dateMap.get(metric.date) || {
      eggsKg: 0,
      feedInKg: 0,
      feedUsedKg: 0,
      hdpPercents: [],
      feedCost: 0,
      eggsRevenue: 0,
      eggsCount: 0,
    };
    existing.eggsKg += metric.eggsKg;
    existing.feedInKg += metric.feedInKg;
    existing.feedUsedKg += metric.feedUsedKg;
    existing.hdpPercents.push(metric.hdpPercent);
    existing.feedCost += metric.feedCost;
    existing.eggsRevenue += metric.eggsRevenue;
    existing.eggsCount += metric.eggsCount;
    dateMap.set(metric.date, existing);
  }

  const trendData = Array.from(dateMap.entries())
    .map(([date, data]) => ({
      date,
      eggsKg: Number(data.eggsKg.toFixed(1)),
      feedInKg: Number(data.feedInKg.toFixed(1)),
      feedUsedKg: Number(data.feedUsedKg.toFixed(1)),
      hdpPercent: Number(
        (data.hdpPercents.reduce((a, b) => a + b, 0) / data.hdpPercents.length).toFixed(2)
      ),
      feedCost: Number(data.feedCost.toFixed(0)),
      eggsRevenue: Number(data.eggsRevenue.toFixed(0)),
      hpp: Number((data.eggsRevenue - data.feedCost).toFixed(0)),
      nilaiHpp: data.eggsKg > 0 ? Number((data.feedCost / data.eggsKg).toFixed(0)) : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const kandangMap = new Map<string, {
    kandangName: string;
    hdps: number[];
    fcrs: number[];
    totalEggsKg: number;
    totalFeedUsed: number;
    recordCount: number;
  }>();

  for (const metric of dailyMetrics) {
    const existing = kandangMap.get(metric.kandangId) || {
      kandangName: metric.kandangName,
      hdps: [],
      fcrs: [],
      totalEggsKg: 0,
      totalFeedUsed: 0,
      recordCount: 0,
    };

    existing.hdps.push(metric.hdpPercent);
    if (metric.fcr > 0) existing.fcrs.push(metric.fcr);
    existing.totalEggsKg += metric.eggsKg;
    existing.totalFeedUsed += metric.feedUsedKg;
    existing.recordCount++;

    kandangMap.set(metric.kandangId, existing);
  }

  const ranking: RankingEntry[] = Array.from(kandangMap.entries())
    .map(([kandangId, data]) => ({
      kandangId,
      kandangName: data.kandangName,
      averageHDP: Number((data.hdps.reduce((a, b) => a + b, 0) / data.hdps.length).toFixed(2)),
      averageFCR: data.fcrs.length > 0
        ? Number((data.fcrs.reduce((a, b) => a + b, 0) / data.fcrs.length).toFixed(2))
        : 0,
      totalEggsKg: Number(data.totalEggsKg.toFixed(1)),
      totalFeedUsed: Number(data.totalFeedUsed.toFixed(1)),
      recordCount: data.recordCount,
    }))
    .sort((a, b) => b.averageHDP - a.averageHDP);

  return {
    dailyMetrics: dailyMetrics.sort((a, b) => b.date.localeCompare(a.date)),
    trendData,
    ranking,
  };
}
