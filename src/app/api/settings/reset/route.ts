import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { kandang, recordings, settings } from "@/lib/db/schema";
import { initialKandang, initialRecordings, initialSettings } from "@/lib/mock/mockData";
import { SETTINGS_ID } from "@/lib/db/constants";

export async function POST() {
  await db.delete(recordings);
  await db.delete(kandang);
  await db.delete(settings);

  const now = new Date().toISOString();
  await db.insert(settings).values({
    id: SETTINGS_ID,
    farmName: initialSettings.farmName,
    defaultTargetHDPPercent: initialSettings.defaultTargetHDPPercent,
    defaultTargetFCR: initialSettings.defaultTargetFCR,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(kandang).values(
    initialKandang.map((item) => ({
      id: item.id,
      name: item.name,
      initialChickenCount: item.initialChickenCount,
      targetHDPPercent: item.targetHDPPercent,
      targetFCR: item.targetFCR,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
  );

  await db.insert(recordings).values(
    initialRecordings.map((item) => ({
      id: item.id,
      kandangId: item.kandangId,
      date: item.date,
      feedInKg: item.feedInKg,
      feedRemainingKg: item.feedRemainingKg,
      feedUsedKg: item.feedUsedKg,
      eggsKg: item.eggsKg,
      eggsCount: item.eggsCount,
      deadChickenCount: item.deadChickenCount,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
  );

  return NextResponse.json({ success: true });
}
