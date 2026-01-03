import { eq } from "drizzle-orm";
import { db, isDatabaseConfigured } from "../index.ts";
import { settings } from "../schema.ts";
import { settingsService } from "../../src/lib/services/settingsService.ts";

const MOCK_SETTINGS_ID = "default";

function withMockId(data: ReturnType<typeof settingsService.get>) {
  return { id: MOCK_SETTINGS_ID, ...data };
}

export type SettingsCreateInput = {
  farmName: string;
  defaultTargetHDPPercent: number;
  defaultTargetFCR: number;
};

export type SettingsUpdateInput = Partial<SettingsCreateInput>;

export async function findAllSettings() {
  if (!isDatabaseConfigured || !db) {
    return [withMockId(settingsService.get())];
  }
  return db.select().from(settings);
}

export async function findSettingsById(id: string) {
  if (!isDatabaseConfigured || !db) {
    const current = withMockId(settingsService.get());
    return current.id === id ? current : null;
  }
  const rows = await db.select().from(settings).where(eq(settings.id, id));
  return rows[0] ?? null;
}

export async function createSettings(data: SettingsCreateInput) {
  if (!isDatabaseConfigured || !db) {
    return withMockId(settingsService.update(data));
  }
  const now = new Date();
  const rows = await db
    .insert(settings)
    .values({
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return rows[0] ?? null;
}

export async function updateSettings(id: string, data: SettingsUpdateInput) {
  if (!isDatabaseConfigured || !db) {
    const current = withMockId(settingsService.get());
    if (current.id !== id) return null;
    return withMockId(settingsService.update(data));
  }
  const rows = await db
    .update(settings)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(settings.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteSettings(id: string) {
  if (!isDatabaseConfigured || !db) {
    const current = withMockId(settingsService.get());
    return current.id === id ? current : null;
  }
  const rows = await db.delete(settings).where(eq(settings.id, id)).returning();
  return rows[0] ?? null;
}
