import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { kandang, recordings, settings } from "@/lib/db/schema";
import { initialKandang, initialRecordings, initialSettings } from "@/lib/mock/mockData";
import { SETTINGS_ID } from "@/lib/db/constants";
import { getAccessContext, isAdmin } from "@/lib/db/access";

export async function POST() {
  const access = await getAccessContext();
  if (!isAdmin(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(recordings);
  await db.delete(kandang);
  await db.delete(settings);

  await db.insert(settings).values({
    id: SETTINGS_ID,
    farmName: initialSettings.farmName,
    defaultTargetHDPPercent: initialSettings.defaultTargetHDPPercent,
    defaultTargetFCR: initialSettings.defaultTargetFCR,
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
      feedPriceKg: item.feedPriceKg,
      feedRemainingKg: item.feedRemainingKg,
      feedUsedKg: item.feedUsedKg,
      eggsKg: item.eggsKg,
      eggsPriceKg: item.eggsPriceKg,
      eggsCount: item.eggsCount,
      whiteEggsKg: item.whiteEggsKg ?? 0,
      whiteEggsCount: item.whiteEggsCount ?? 0,
      brokenEggsCount: item.brokenEggsCount ?? 0,
      deadChickenCount: item.deadChickenCount,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
  );

  return NextResponse.json({ success: true });
}
