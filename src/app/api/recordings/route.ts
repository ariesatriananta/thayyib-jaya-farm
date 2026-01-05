import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { recordings } from "@/lib/db/schema";
import { mapRecording } from "@/lib/db/mappers";
import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { getAccessContext } from "@/lib/db/access";

export async function GET(request: Request) {
  const access = await getAccessContext();
  const { searchParams } = new URL(request.url);
  const kandangId = searchParams.get("kandangId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const date = searchParams.get("date");

  if (access.role === "staff") {
    if (!access.kandangIds || access.kandangIds.length === 0) {
      return NextResponse.json(date && kandangId ? null : []);
    }

    if (kandangId && !access.kandangIds.includes(kandangId)) {
      return NextResponse.json(date && kandangId ? null : []);
    }
  }

  if (date && kandangId) {
    const rows = await db
      .select()
      .from(recordings)
      .where(and(eq(recordings.date, date), eq(recordings.kandangId, kandangId)))
      .limit(1);
    return NextResponse.json(rows.length ? mapRecording(rows[0]) : null);
  }

  const conditions = [];

  if (startDate && endDate) {
    conditions.push(gte(recordings.date, startDate), lte(recordings.date, endDate));
  }

  if (kandangId) {
    conditions.push(eq(recordings.kandangId, kandangId));
  }

  if (access.role === "staff" && access.kandangIds && access.kandangIds.length > 0) {
    conditions.push(inArray(recordings.kandangId, access.kandangIds));
  }

  const query = db.select().from(recordings);
  const rows = conditions.length
    ? await query.where(and(...conditions)).orderBy(desc(recordings.date))
    : await query.orderBy(desc(recordings.date));
  return NextResponse.json(rows.map(mapRecording));
}

export async function POST(request: Request) {
  const access = await getAccessContext();
  if (access.role === "staff") {
    if (!access.kandangIds || access.kandangIds.length === 0) {
      return NextResponse.json({ error: "Belum ada akses kandang" }, { status: 403 });
    }
  }

  const body = await request.json();
  if (access.role === "staff" && !access.kandangIds?.includes(body.kandangId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const feedUsedKg = Math.max(0, body.feedInKg - body.feedRemainingKg);

  const [created] = await db.insert(recordings).values({
    id: randomUUID(),
    kandangId: body.kandangId,
    date: body.date,
    feedInKg: body.feedInKg,
    feedRemainingKg: body.feedRemainingKg,
    feedUsedKg,
    eggsKg: body.eggsKg,
    eggsCount: body.eggsCount,
    deadChickenCount: body.deadChickenCount,
    notes: body.notes || "",
  }).returning();

  return NextResponse.json(mapRecording(created));
}
