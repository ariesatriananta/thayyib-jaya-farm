export interface Kandang {
  id: string;
  name: string;
  initialChickenCount: number;
  targetHDPPercent: number;
  targetFCR: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Recording {
  id: string;
  kandangId: string;
  date: string;
  feedInKg: number;
  feedRemainingKg: number;
  feedUsedKg: number;
  eggsKg: number;
  eggsCount: number;
  deadChickenCount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyMetrics {
  date: string;
  kandangId: string;
  kandangName: string;
  totalChickenToday: number;
  feedInKg: number;
  feedRemainingKg: number;
  feedUsedKg: number;
  eggsKg: number;
  eggsCount: number;
  deadChickenCount: number;
  fcr: number;
  hdpPercent: number;
  weekNumber: number;
  monthLabel: string;
  dayName: string;
  notes: string;
}

export interface DashboardSummary {
  totalEggsKg: number;
  totalEggsCount: number;
  totalFeedUsed: number;
  totalDeadChickens: number;
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
