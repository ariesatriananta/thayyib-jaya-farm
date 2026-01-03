import { eq } from "drizzle-orm";
import { db, isDatabaseConfigured } from "../index.ts";
import { kandang } from "../schema.ts";
import { kandangService } from "../../src/lib/services/kandangService.ts";

export type KandangCreateInput = {
  name: string;
  initialChickenCount: number;
  targetHDPPercent: number;
  targetFCR: number;
  status: string;
};

export type KandangUpdateInput = Partial<KandangCreateInput>;

export async function findAllKandang() {
  if (!isDatabaseConfigured || !db) {
    return kandangService.getAll();
  }
  return db.select().from(kandang);
}

export async function findKandangById(id: string) {
  if (!isDatabaseConfigured || !db) {
    return kandangService.getById(id) ?? null;
  }
  const rows = await db.select().from(kandang).where(eq(kandang.id, id));
  return rows[0] ?? null;
}

export async function createKandang(data: KandangCreateInput) {
  if (!isDatabaseConfigured || !db) {
    return kandangService.create(data);
  }
  const now = new Date();
  const rows = await db
    .insert(kandang)
    .values({
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return rows[0] ?? null;
}

export async function updateKandang(id: string, data: KandangUpdateInput) {
  if (!isDatabaseConfigured || !db) {
    return kandangService.update(id, data) ?? null;
  }
  const rows = await db
    .update(kandang)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(kandang.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteKandang(id: string) {
  if (!isDatabaseConfigured || !db) {
    const existing = kandangService.getById(id);
    const deleted = kandangService.delete(id);
    return deleted ? existing ?? null : null;
  }
  const rows = await db.delete(kandang).where(eq(kandang.id, id)).returning();
  return rows[0] ?? null;
}
