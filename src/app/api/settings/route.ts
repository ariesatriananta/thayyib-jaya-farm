import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { mapSettings } from "@/lib/db/mappers";
import { initialSettings } from "@/lib/mock/mockData";
import { SETTINGS_ID } from "@/lib/db/constants";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(settings).limit(1);
  if (rows.length === 0) {
    const now = new Date().toISOString();
    const [created] = await db.insert(settings).values({
      id: SETTINGS_ID,
      farmName: initialSettings.farmName,
      defaultTargetHDPPercent: initialSettings.defaultTargetHDPPercent,
      defaultTargetFCR: initialSettings.defaultTargetFCR,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return NextResponse.json(mapSettings(created));
  }

  return NextResponse.json(mapSettings(rows[0]));
}

export async function PUT(request: Request) {
  const body = await request.json();
  const now = new Date().toISOString();
  const existing = await db.select().from(settings).limit(1);
  if (existing.length > 0) {
    const [updated] = await db
      .update(settings)
      .set({
        farmName: body.farmName,
        defaultTargetHDPPercent: body.defaultTargetHDPPercent,
        defaultTargetFCR: body.defaultTargetFCR,
        updatedAt: now,
      })
      .where(eq(settings.id, existing[0].id))
      .returning();
    return NextResponse.json(mapSettings(updated));
  }

  const [created] = await db.insert(settings).values({
    id: SETTINGS_ID,
    farmName: body.farmName,
    defaultTargetHDPPercent: body.defaultTargetHDPPercent,
    defaultTargetFCR: body.defaultTargetFCR,
    createdAt: now,
    updatedAt: now,
  }).returning();

  return NextResponse.json(mapSettings(created));
}
