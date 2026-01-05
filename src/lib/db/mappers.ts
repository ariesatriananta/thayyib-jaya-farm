import type { InferSelectModel } from "drizzle-orm";
import type { Kandang, Recording, Settings } from "@/lib/mock/types";
import { kandang, recordings, settings as settingsTable } from "./schema";

export type KandangRow = InferSelectModel<typeof kandang>;
export type RecordingRow = InferSelectModel<typeof recordings>;
export type SettingsRow = InferSelectModel<typeof settingsTable>;

export function mapKandang(row: KandangRow): Kandang {
  const status = row.status === "active" || row.status === "inactive" ? row.status : "inactive";

  return {
    id: row.id,
    name: row.name,
    initialChickenCount: row.initialChickenCount,
    targetHDPPercent: row.targetHDPPercent,
    targetFCR: row.targetFCR,
    status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapRecording(row: RecordingRow): Recording {
  return {
    id: row.id,
    kandangId: row.kandangId,
    date: row.date,
    feedInKg: row.feedInKg,
    feedPriceKg: row.feedPriceKg,
    feedRemainingKg: row.feedRemainingKg,
    feedUsedKg: row.feedUsedKg,
    eggsKg: row.eggsKg,
    eggsPriceKg: row.eggsPriceKg,
    eggsCount: row.eggsCount,
    deadChickenCount: row.deadChickenCount,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapSettings(row: SettingsRow): Settings {
  return {
    farmName: row.farmName,
    defaultTargetHDPPercent: row.defaultTargetHDPPercent,
    defaultTargetFCR: row.defaultTargetFCR,
  };
}
