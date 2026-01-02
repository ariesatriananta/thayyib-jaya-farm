import { format, getWeek, getDay } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { Recording, Kandang, DailyMetrics } from './types';

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function calculateFeedUsed(feedIn: number, feedRemaining: number): number {
  return Math.max(0, feedIn - feedRemaining);
}

export function calculateFCR(feedUsedKg: number, eggsKg: number): number {
  if (eggsKg <= 0) return 0;
  return Number((feedUsedKg / eggsKg).toFixed(2));
}

export function calculateHDP(eggsCount: number, totalChicken: number): number {
  if (totalChicken <= 0) return 0;
  return Number(((eggsCount / totalChicken) * 100).toFixed(2));
}

export function getCumulativeDeadChickens(
  recordings: Recording[],
  kandangId: string,
  upToDate: string
): number {
  return recordings
    .filter(r => r.kandangId === kandangId && r.date <= upToDate)
    .reduce((sum, r) => sum + r.deadChickenCount, 0);
}

export function getTotalChickenToday(
  kandang: Kandang,
  recordings: Recording[],
  date: string
): number {
  const cumulativeDead = getCumulativeDeadChickens(recordings, kandang.id, date);
  return Math.max(0, kandang.initialChickenCount - cumulativeDead);
}

export function getWeekNumber(date: Date): number {
  return getWeek(date, { weekStartsOn: 1 });
}

export function getMonthLabel(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: idLocale });
}

export function getDayName(date: Date): string {
  return dayNames[getDay(date)];
}

export function getHDPStatus(hdpPercent: number): 'excellent' | 'good' | 'warning' | 'danger' {
  if (hdpPercent >= 85) return 'excellent';
  if (hdpPercent >= 75) return 'good';
  if (hdpPercent >= 60) return 'warning';
  return 'danger';
}

export function buildDailyMetrics(
  recording: Recording,
  kandang: Kandang,
  allRecordings: Recording[]
): DailyMetrics {
  const date = new Date(recording.date);
  const totalChickenToday = getTotalChickenToday(kandang, allRecordings, recording.date);
  const feedUsedKg = calculateFeedUsed(recording.feedInKg, recording.feedRemainingKg);
  const fcr = calculateFCR(feedUsedKg, recording.eggsKg);
  const hdpPercent = calculateHDP(recording.eggsCount, totalChickenToday);

  return {
    date: recording.date,
    kandangId: recording.kandangId,
    kandangName: kandang.name,
    totalChickenToday,
    feedInKg: recording.feedInKg,
    feedRemainingKg: recording.feedRemainingKg,
    feedUsedKg,
    eggsKg: recording.eggsKg,
    eggsCount: recording.eggsCount,
    deadChickenCount: recording.deadChickenCount,
    fcr,
    hdpPercent,
    weekNumber: getWeekNumber(date),
    monthLabel: getMonthLabel(date),
    dayName: getDayName(date),
    notes: recording.notes,
  };
}

export function calculateAverages(metrics: DailyMetrics[]): {
  averageFCR: number;
  averageHDP: number;
} {
  if (metrics.length === 0) {
    return { averageFCR: 0, averageHDP: 0 };
  }

  const validFCRs = metrics.filter(m => m.fcr > 0);
  const validHDPs = metrics.filter(m => m.hdpPercent > 0);

  const averageFCR = validFCRs.length > 0
    ? Number((validFCRs.reduce((sum, m) => sum + m.fcr, 0) / validFCRs.length).toFixed(2))
    : 0;

  const averageHDP = validHDPs.length > 0
    ? Number((validHDPs.reduce((sum, m) => sum + m.hdpPercent, 0) / validHDPs.length).toFixed(2))
    : 0;

  return { averageFCR, averageHDP };
}
