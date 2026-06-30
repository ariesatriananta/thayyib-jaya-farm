export interface Kandang {
  id: string;
  name: string;
  initialChickenCount: number;
  targetHDPPercent: number;
  targetFCR: number;
  status: 'active' | 'inactive';
  ageReferenceDays?: number | null;
  ageReferenceDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Recording {
  id: string;
  kandangId: string;
  date: string;
  feedInKg: number;
  feedPriceKg: number;
  feedRemainingKg: number;
  feedUsedKg: number;
  eggsKg: number;
  eggsPriceKg: number;
  eggsCount: number;
  whiteEggsKg: number;
  whiteEggsCount: number;
  brokenEggsCount: number;
  deadChickenCount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyMetrics {
  date: string;
  recordingId?: string;
  kandangId: string;
  kandangName: string;
  totalChickenToday: number;
  feedInKg: number;
  feedPriceKg: number;
  feedRemainingKg: number;
  feedUsedKg: number;
  eggsKg: number;
  eggsPriceKg: number;
  eggsCount: number;
  whiteEggsKg: number;
  whiteEggsCount: number;
  brokenEggsCount: number;
  deadChickenCount: number;
  feedCost: number;
  eggsRevenue: number;
  hpp: number;
  fcr: number;
  hdpPercent: number;
  weekNumber: number;
  monthLabel: string;
  dayName: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalEggsKg: number;
  totalEggsCount: number;
  totalWhiteEggsKg: number;
  totalWhiteEggsCount: number;
  totalBrokenEggsCount: number;
  totalFeedIn: number;
  totalFeedUsed: number;
  totalDeadChickens: number;
  totalEggsRevenue: number;
  totalFeedCost: number;
  totalHpp: number;
  averageFCR: number;
  averageHDP: number;
  kandangCount: number;
  activeKandangCount: number;
}

export interface KandangStatus {
  kandang: Kandang;
  todayMetrics: DailyMetrics | null;
  hdpStatus: 'excellent' | 'good' | 'warning' | 'danger';
}

export interface Settings {
  defaultTargetHDPPercent: number;
  defaultTargetFCR: number;
  farmName: string;
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  kandangId: string | 'all';
  kandangIds?: string[];
}

export interface RankingEntry {
  kandangId: string;
  kandangName: string;
  averageHDP: number;
  averageFCR: number;
  totalEggsKg: number;
  totalFeedUsed: number;
  recordCount: number;
}
