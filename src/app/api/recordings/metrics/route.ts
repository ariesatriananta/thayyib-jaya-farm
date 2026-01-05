import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { kandang as kandangTable, recordings } from "@/lib/db/schema";
import { mapKandang, mapRecording } from "@/lib/db/mappers";
import { buildDailyMetrics } from "@/lib/mock/calculations";
import type { DailyMetrics } from "@/lib/mock/types";
import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { getAccessContext } from "@/lib/db/access";

export async function GET(request: Request) {
  const access = await getAccessContext();
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const kandangId = searchParams.get("kandangId");

  if (!startDate || !endDate) {
    return NextResponse.json([]);
  }

  if (access.role === "staff") {
    if (!access.kandangIds || access.kandangIds.length === 0) {
      return NextResponse.json([]);
    }
    if (kandangId && !access.kandangIds.includes(kandangId)) {
      return NextResponse.json([]);
    }
  }

  const conditions = [
    gte(recordings.date, startDate),
    lte(recordings.date, endDate),
  ];

  if (kandangId) {
    conditions.push(eq(recordings.kandangId, kandangId));
  }

  if (access.role === "staff" && access.kandangIds && access.kandangIds.length > 0) {
    conditions.push(inArray(recordings.kandangId, access.kandangIds));
  }

  const filteredRows = await db
    .select()
    .from(recordings)
    .where(and(...conditions))
    .orderBy(desc(recordings.date));

  const allRecordingsRows = access.role === "staff" && access.kandangIds?.length
    ? await db.select().from(recordings).where(inArray(recordings.kandangId, access.kandangIds))
    : await db.select().from(recordings);
  const kandangRows = access.role === "staff" && access.kandangIds?.length
    ? await db.select().from(kandangTable).where(inArray(kandangTable.id, access.kandangIds))
    : await db.select().from(kandangTable);

  const kandangMap = new Map(kandangRows.map((row) => [row.id, mapKandang(row)]));
  const allRecordings = allRecordingsRows.map(mapRecording);

  const metrics = filteredRows.map((row) => {
    const recording = mapRecording(row);
    const kandang = kandangMap.get(recording.kandangId);
    if (!kandang) return null;
    return buildDailyMetrics(recording, kandang, allRecordings);
  }).filter((item): item is DailyMetrics => item !== null);

  return NextResponse.json(metrics);
}
