import * as db from '../mock/mockDb.ts';
import { buildDailyMetrics } from '../mock/calculations.ts';
import type { Recording, DailyMetrics } from '../mock/types.ts';

export interface CreateRecordingInput {
  kandangId: string;
  date: string;
  feedInKg: number;
  feedRemainingKg: number;
  eggsKg: number;
  eggsCount: number;
  deadChickenCount: number;
  notes: string;
}

export const recordingService = {
  getAll(): Recording[] {
    return db.getAllRecordings();
  },

  getById(id: string): Recording | undefined {
    return db.getRecordingById(id);
  },

  getByKandang(kandangId: string): Recording[] {
    return db.getRecordingsByKandang(kandangId);
  },

  getByDateRange(startDate: string, endDate: string, kandangId?: string): Recording[] {
    let recordings = db.getRecordingsByDateRange(startDate, endDate);
    
    if (kandangId && kandangId !== 'all') {
      recordings = recordings.filter(r => r.kandangId === kandangId);
    }
    
    return recordings;
  },

  getByDateAndKandang(date: string, kandangId: string): Recording | undefined {
    return db.getRecordingByDateAndKandang(date, kandangId);
  },

  existsForDateAndKandang(date: string, kandangId: string): boolean {
    return !!db.getRecordingByDateAndKandang(date, kandangId);
  },

  create(data: CreateRecordingInput): Recording {
    return db.createRecording(data);
  },

  update(id: string, data: Partial<Recording>): Recording | undefined {
    return db.updateRecording(id, data);
  },

  delete(id: string): boolean {
    return db.deleteRecording(id);
  },

  getMetrics(recording: Recording): DailyMetrics | null {
    const kandang = db.getKandangById(recording.kandangId);
    if (!kandang) return null;

    const allRecordings = db.getAllRecordings();
    return buildDailyMetrics(recording, kandang, allRecordings);
  },

  getMetricsByDateRange(startDate: string, endDate: string, kandangId?: string): DailyMetrics[] {
    const recordings = this.getByDateRange(startDate, endDate, kandangId);
    const allRecordings = db.getAllRecordings();
    const metrics: DailyMetrics[] = [];

    for (const recording of recordings) {
      const kandang = db.getKandangById(recording.kandangId);
      if (kandang) {
        metrics.push(buildDailyMetrics(recording, kandang, allRecordings));
      }
    }

    return metrics.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
};
