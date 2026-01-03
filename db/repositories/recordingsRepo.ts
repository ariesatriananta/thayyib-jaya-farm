import { and, eq, gte, lte } from "drizzle-orm";
import { db, isDatabaseConfigured } from "../index.ts";
import { recordings } from "../schema.ts";
import { recordingService } from "../../src/lib/services/recordingService.ts";

export type RecordingCreateInput = {
  kandangId: string;
  date: string;
  feedInKg: number;
  feedRemainingKg: number;
  feedUsedKg: number;
  eggsKg: number;
  eggsCount: number;
  deadChickenCount: number;
  notes: string;
};

export type RecordingUpdateInput = Partial<RecordingCreateInput>;

export async function findAllRecordings() {
  if (!isDatabaseConfigured || !db) {
    return recordingService.getAll();
  }
  return db.select().from(recordings);
}

export async function findRecordingById(id: string) {
  if (!isDatabaseConfigured || !db) {
    return recordingService.getById(id) ?? null;
  }
  const rows = await db.select().from(recordings).where(eq(recordings.id, id));
  return rows[0] ?? null;
}

export async function findRecordingsByDate(date: string, kandangId?: string) {
  if (!isDatabaseConfigured || !db) {
    const items = recordingService.getByDateRange(date, date, kandangId);
    return items;
  }
  if (kandangId) {
    return db
      .select()
      .from(recordings)
      .where(and(eq(recordings.date, date), eq(recordings.kandangId, kandangId)));
  }
  return db.select().from(recordings).where(eq(recordings.date, date));
}

export async function findRecordingsByDateRange(
  from: string,
  to: string,
  kandangId?: string
) {
  if (!isDatabaseConfigured || !db) {
    return recordingService.getByDateRange(from, to, kandangId);
  }
  const rangeFilter = and(gte(recordings.date, from), lte(recordings.date, to));
  if (kandangId) {
    return db
      .select()
      .from(recordings)
      .where(and(rangeFilter, eq(recordings.kandangId, kandangId)));
  }
  return db.select().from(recordings).where(rangeFilter);
}

export async function createRecording(data: RecordingCreateInput) {
  if (!isDatabaseConfigured || !db) {
    return recordingService.create(data);
  }
  const now = new Date();
  const rows = await db
    .insert(recordings)
    .values({
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return rows[0] ?? null;
}

export async function updateRecording(id: string, data: RecordingUpdateInput) {
  if (!isDatabaseConfigured || !db) {
    return recordingService.update(id, data) ?? null;
  }
  const rows = await db
    .update(recordings)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(recordings.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteRecording(id: string) {
  if (!isDatabaseConfigured || !db) {
    const existing = recordingService.getById(id);
    const deleted = recordingService.delete(id);
    return deleted ? existing ?? null : null;
  }
  const rows = await db.delete(recordings).where(eq(recordings.id, id)).returning();
  return rows[0] ?? null;
}
