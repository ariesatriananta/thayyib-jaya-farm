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
import { buildDailyMetrics, calculateAverages, getHDPStatus } from "@/lib/mock/calculations";

export function buildDashboardSummary(
  kandangList: Kandang[],
  allRecordings: Recording[],
  date?: string
): DashboardSummary {
  const targetDate = date || format(new Date(), "yyyy-MM-dd");
  const todayRecordings = allRecordings.filter((r) => r.date === targetDate);
  const activeKandang = kandangList.filter((k) => k.status === "active");

  const metrics: DailyMetrics[] = [];
  for (const recording of todayRecordings) {
    const kandang = kandangList.find((k) => k.id === recording.kandangId);
    if (kandang) {
      metrics.push(buildDailyMetrics(recording, kandang, allRecordings));
    }
  }

  const { averageFCR, averageHDP } = calculateAverages(metrics);
  const totalFeedCost = metrics.reduce((sum, m) => sum + m.feedCost, 0);
  const totalEggsRevenue = metrics.reduce((sum, m) => sum + m.eggsRevenue, 0);
  const totalHpp = totalEggsRevenue - totalFeedCost;

  return {
    totalEggsKg: Number(metrics.reduce((sum, m) => sum + m.eggsKg, 0).toFixed(1)),
    totalEggsCount: metrics.reduce((sum, m) => sum + m.eggsCount, 0),
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
  date?: string
): KandangStatus[] {
  const targetDate = date || format(new Date(), "yyyy-MM-dd");
  const activeKandang = kandangList.filter((k) => k.status === "active");

  return activeKandang.map((kandang) => {
    const todayRecording = allRecordings.find(
      (r) => r.kandangId === kandang.id && r.date === targetDate
    );

    let todayMetrics: DailyMetrics | null = null;
    let hdpStatus: "excellent" | "good" | "warning" | "danger" = "warning";

    if (todayRecording) {
      todayMetrics = buildDailyMetrics(todayRecording, kandang, allRecordings);
      hdpStatus = getHDPStatus(todayMetrics.hdpPercent);
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
