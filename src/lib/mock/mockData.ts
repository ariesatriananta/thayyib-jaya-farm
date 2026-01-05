import { format, subDays } from 'date-fns';
import { randomUUID } from 'crypto';
import type { Kandang, Recording, Settings } from './types';

function generateId(): string {
  return randomUUID();
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 1): number {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

// Generate 8 sample kandang
export const initialKandang: Kandang[] = [
  {
    id: 'e1b7d5a6-0b5e-4f2e-9b1c-1a2b3c4d5e01',
    name: 'Kandang A1',
    initialChickenCount: 5000,
    targetHDPPercent: 90,
    targetFCR: 2.2,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'e1b7d5a6-0b5e-4f2e-9b1c-1a2b3c4d5e02',
    name: 'Kandang A2',
    initialChickenCount: 4500,
    targetHDPPercent: 90,
    targetFCR: 2.2,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'e1b7d5a6-0b5e-4f2e-9b1c-1a2b3c4d5e03',
    name: 'Kandang B1',
    initialChickenCount: 6000,
    targetHDPPercent: 88,
    targetFCR: 2.3,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'e1b7d5a6-0b5e-4f2e-9b1c-1a2b3c4d5e04',
    name: 'Kandang B2',
    initialChickenCount: 5500,
    targetHDPPercent: 88,
    targetFCR: 2.3,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'e1b7d5a6-0b5e-4f2e-9b1c-1a2b3c4d5e05',
    name: 'Kandang C1',
    initialChickenCount: 4000,
    targetHDPPercent: 85,
    targetFCR: 2.4,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'e1b7d5a6-0b5e-4f2e-9b1c-1a2b3c4d5e06',
    name: 'Kandang C2',
    initialChickenCount: 4200,
    targetHDPPercent: 85,
    targetFCR: 2.4,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'e1b7d5a6-0b5e-4f2e-9b1c-1a2b3c4d5e07',
    name: 'Kandang D1',
    initialChickenCount: 3500,
    targetHDPPercent: 90,
    targetFCR: 2.2,
    status: 'inactive',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'e1b7d5a6-0b5e-4f2e-9b1c-1a2b3c4d5e08',
    name: 'Kandang D2',
    initialChickenCount: 5200,
    targetHDPPercent: 90,
    targetFCR: 2.2,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Generate 30 days of recordings per active kandang
function generateRecordings(): Recording[] {
  const recordings: Recording[] = [];
  const today = new Date();
  
  const lowPerformanceKandangIds = [
    'e1b7d5a6-0b5e-4f2e-9b1c-1a2b3c4d5e05',
    'e1b7d5a6-0b5e-4f2e-9b1c-1a2b3c4d5e06',
  ]; // These will have occasional low HDP
  const highPerformanceKandangIds = [
    'e1b7d5a6-0b5e-4f2e-9b1c-1a2b3c4d5e01',
    'e1b7d5a6-0b5e-4f2e-9b1c-1a2b3c4d5e03',
  ];

  initialKandang.forEach((kandang) => {
    if (kandang.status === 'inactive') return;
    let cumulativeDead = 0;

    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      
      // Determine performance level for this day
      const isLowPerformanceKandang = lowPerformanceKandangIds.includes(kandang.id);
      const isHighPerformanceKandang = highPerformanceKandangIds.includes(kandang.id);
      const hasLowDay = Math.random() < (isLowPerformanceKandang ? 0.25 : isHighPerformanceKandang ? 0.08 : 0.15);
      const liveChicken = Math.max(0, kandang.initialChickenCount - cumulativeDead);
      
      let feedInKg: number;
      let feedRemainingKg: number;
      let eggsKg: number;
      let eggsCount: number;
      let deadChickenCount: number;
      
      if (hasLowDay) {
        // Low performance day
        const hdpPercent = isLowPerformanceKandang
          ? randomFloat(0.45, 0.6, 3)
          : randomFloat(0.6, 0.72, 3);
        eggsCount = Math.min(liveChicken, Math.round(liveChicken * hdpPercent));
        eggsKg = Number((eggsCount * randomFloat(0.058, 0.064, 3)).toFixed(1));
        const feedUsed = Number((eggsKg * randomFloat(2.2, 2.9, 2)).toFixed(1));
        feedInKg = Number((feedUsed + randomFloat(4, 12, 1)).toFixed(1));
        feedRemainingKg = Number((feedInKg - feedUsed).toFixed(1));
        deadChickenCount = randomBetween(3, isLowPerformanceKandang ? 10 : 6);
      } else {
        // Normal/good performance day
        const hdpPercent = isHighPerformanceKandang
          ? randomFloat(0.85, 0.95, 3)
          : randomFloat(0.72, 0.88, 3);
        eggsCount = Math.min(liveChicken, Math.round(liveChicken * hdpPercent));
        eggsKg = Number((eggsCount * randomFloat(0.058, 0.065, 3)).toFixed(1));
        const feedUsed = Number((eggsKg * randomFloat(1.8, 2.5, 2)).toFixed(1));
        feedInKg = Number((feedUsed + randomFloat(0, 10, 1)).toFixed(1));
        feedRemainingKg = Number((feedInKg - feedUsed).toFixed(1));
        deadChickenCount = randomBetween(0, isLowPerformanceKandang ? 4 : 3);
      }
      cumulativeDead += deadChickenCount;

      const recording: Recording = {
        id: generateId(),
        kandangId: kandang.id,
        date,
        feedInKg,
        feedRemainingKg,
        feedUsedKg: Math.max(0, feedInKg - feedRemainingKg),
        eggsKg,
        eggsCount,
        deadChickenCount,
        notes: hasLowDay ? 'Produksi menurun - cuaca panas' : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      recordings.push(recording);
    }
  });

  return recordings;
}

export const initialRecordings: Recording[] = generateRecordings();

export const initialSettings: Settings = {
  defaultTargetHDPPercent: 90,
  defaultTargetFCR: 2.2,
  farmName: 'Thayyib Jaya Farm',
};

export function createNewId(): string {
  return generateId();
}
