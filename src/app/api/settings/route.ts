import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { mapSettings } from "@/lib/db/mappers";
import { initialSettings } from "@/lib/mock/mockData";
import { SETTINGS_ID } from "@/lib/db/constants";
import { eq } from "drizzle-orm";
import { getAccessContext, isAdmin } from "@/lib/db/access";

export async function GET() {
  const access = await getAccessContext();
  if (!isAdmin(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await db.select().from(settings).limit(1);
  if (rows.length === 0) {
    const [created] = await db.insert(settings).values({
      id: SETTINGS_ID,
      farmName: initialSettings.farmName,
      defaultTargetHDPPercent: initialSettings.defaultTargetHDPPercent,
      defaultTargetFCR: initialSettings.defaultTargetFCR,
    }).returning();
    return NextResponse.json(mapSettings(created));
  }

  return NextResponse.json(mapSettings(rows[0]));
}

export async function PUT(request: Request) {
  const access = await getAccessContext();
  if (!isAdmin(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const existing = await db.select().from(settings).limit(1);
  if (existing.length > 0) {
    const [updated] = await db
      .update(settings)
      .set({
        farmName: body.farmName,
        defaultTargetHDPPercent: body.defaultTargetHDPPercent,
        defaultTargetFCR: body.defaultTargetFCR,
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
  }).returning();

  return NextResponse.json(mapSettings(created));
}
