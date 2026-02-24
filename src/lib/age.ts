export interface ChickenAgeParts {
  week: number;
  day: number;
}

function toDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function weekDayToAgeDays(week: number, day: number): number {
  if (!Number.isFinite(week) || !Number.isFinite(day)) return 0;
  if (week < 1 || day < 1 || day > 7) return 0;
  return (Math.floor(week) - 1) * 7 + Math.floor(day);
}

export function ageDaysToWeekDay(ageDays: number): ChickenAgeParts | null {
  if (!Number.isFinite(ageDays) || ageDays < 1) return null;
  const normalized = Math.floor(ageDays);
  return {
    week: Math.floor((normalized - 1) / 7) + 1,
    day: ((normalized - 1) % 7) + 1,
  };
}

export function computeChickenAgeDays(
  referenceDays?: number | null,
  referenceDate?: string | null,
  targetDate?: string
): number | null {
  if (!referenceDays || referenceDays < 1 || !referenceDate) return null;
  const target = targetDate ? toDateOnly(targetDate) : new Date();
  const reference = toDateOnly(referenceDate);
  const diffMs = target.getTime() - reference.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(referenceDays) + diffDays);
}

export function formatChickenAge(ageDays?: number | null): string | null {
  const parts = ageDaysToWeekDay(ageDays ?? 0);
  if (!parts) return null;
  return `Minggu ke-${parts.week} hari ke-${parts.day}`;
}

export function formatChickenAgeFromReference(
  referenceDays?: number | null,
  referenceDate?: string | null,
  targetDate?: string
): string | null {
  const ageDays = computeChickenAgeDays(referenceDays, referenceDate, targetDate);
  return formatChickenAge(ageDays);
}
