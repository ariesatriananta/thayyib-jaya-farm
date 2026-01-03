import { format } from "date-fns";
import type {
  DashboardSummary,
  DailyMetrics,
  Kandang,
  KandangStatus,
  RankingEntry,
  Recording,
  ReportFilters,
} from "./types";
import { buildDailyMetrics, calculateAverages, getHDPStatus } from "./calculations";

export function buildDashboardSummary(
  date: string | undefined,
  kandangList: Kandang[],
  allRecordings: Recording[]
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

  return {
    totalEggsKg: Number(metrics.reduce((sum, m) => sum + m.eggsKg, 0).toFixed(1)),
    totalEggsCount: metrics.reduce((sum, m) => sum + m.eggsCount, 0),
    totalFeedUsed: Number(metrics.reduce((sum, m) => sum + m.feedUsedKg, 0).toFixed(1)),
    totalDeadChickens: metrics.reduce((sum, m) => sum + m.deadChickenCount, 0),
    averageFCR,
    averageHDP,
    kandangCount: kandangList.length,
    activeKandangCount: activeKandang.length,
  };
}

export function buildKandangStatuses(
  date: string | undefined,
  kandangList: Kandang[],
  allRecordings: Recording[]
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

export function buildTopPerformers(
  date: string | undefined,
  kandangList: Kandang[],
  allRecordings: Recording[],
  limit: number = 3
): KandangStatus[] {
  const statuses = buildKandangStatuses(date, kandangList, allRecordings);
  return statuses
    .filter((s) => s.todayMetrics)
    .sort((a, b) => (b.todayMetrics?.hdpPercent || 0) - (a.todayMetrics?.hdpPercent || 0))
    .slice(0, limit);
}

export function buildBottomPerformers(
  date: string | undefined,
  kandangList: Kandang[],
  allRecordings: Recording[],
  limit: number = 3
): KandangStatus[] {
  const statuses = buildKandangStatuses(date, kandangList, allRecordings);
  return statuses
    .filter((s) => s.todayMetrics)
    .sort((a, b) => (a.todayMetrics?.hdpPercent || 0) - (b.todayMetrics?.hdpPercent || 0))
    .slice(0, limit);
}

export function buildMetricsByDateRange(
  startDate: string,
  endDate: string,
  kandangId: string | "all",
  kandangList: Kandang[],
  allRecordings: Recording[]
): DailyMetrics[] {
  let recordings = allRecordings.filter(
    (r) => r.date >= startDate && r.date <= endDate
  );

  if (kandangId !== "all") {
    recordings = recordings.filter((r) => r.kandangId === kandangId);
  }

  const metrics: DailyMetrics[] = [];
  for (const recording of recordings) {
    const kandang = kandangList.find((k) => k.id === recording.kandangId);
    if (kandang) {
      metrics.push(buildDailyMetrics(recording, kandang, allRecordings));
    }
  }

  return metrics.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function buildReportData(
  filters: ReportFilters,
  kandangList: Kandang[],
  allRecordings: Recording[]
): {
  dailyMetrics: DailyMetrics[];
  trendData: { date: string; eggsKg: number; feedUsedKg: number; hdpPercent: number }[];
  ranking: RankingEntry[];
} {
  const { startDate, endDate, kandangId } = filters;
  const recordings = allRecordings.filter(
    (r) => r.date >= startDate && r.date <= endDate
  );

  const filteredRecordings =
    kandangId === "all" ? recordings : recordings.filter((r) => r.kandangId === kandangId);

  const dailyMetrics: DailyMetrics[] = [];
  for (const recording of filteredRecordings) {
    const kandang = kandangList.find((k) => k.id === recording.kandangId);
    if (kandang) {
      dailyMetrics.push(buildDailyMetrics(recording, kandang, allRecordings));
    }
  }

  const dateMap = new Map<
    string,
    { eggsKg: number; feedUsedKg: number; hdpPercents: number[] }
  >();

  for (const metric of dailyMetrics) {
    const existing = dateMap.get(metric.date) || {
      eggsKg: 0,
      feedUsedKg: 0,
      hdpPercents: [],
    };
    existing.eggsKg += metric.eggsKg;
    existing.feedUsedKg += metric.feedUsedKg;
    existing.hdpPercents.push(metric.hdpPercent);
    dateMap.set(metric.date, existing);
  }

  const trendData = Array.from(dateMap.entries())
    .map(([date, data]) => ({
      date,
      eggsKg: Number(data.eggsKg.toFixed(1)),
      feedUsedKg: Number(data.feedUsedKg.toFixed(1)),
      hdpPercent: Number(
        (data.hdpPercents.reduce((a, b) => a + b, 0) / data.hdpPercents.length).toFixed(2)
      ),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const kandangMap = new Map<
    string,
    {
      kandangName: string;
      hdps: number[];
      fcrs: number[];
      totalEggsKg: number;
      totalFeedUsed: number;
      recordCount: number;
    }
  >();

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
      averageFCR:
        data.fcrs.length > 0
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
