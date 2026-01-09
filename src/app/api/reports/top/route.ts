import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { kandang as kandangTable, recordings } from "@/lib/db/schema";
import { mapKandang, mapRecording } from "@/lib/db/mappers";
import { buildKandangStatuses, buildTopPerformers } from "@/lib/reporting";
import { getAccessContext } from "@/lib/db/access";
import { inArray } from "drizzle-orm";

export async function GET(request: Request) {
  const access = await getAccessContext();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const filters = startDate && endDate ? { startDate, endDate } : { date };
  const limit = Number(searchParams.get("limit") || 3);
  const kandangIdsParam = searchParams.get("kandangIds");
  const requestedIds = kandangIdsParam
    ? kandangIdsParam.split(",").map((id) => id.trim()).filter(Boolean)
    : null;
  const allowedIds = access.role === "staff" ? (access.kandangIds || []) : null;
  const filteredIds = requestedIds
    ? requestedIds.filter((id) => !allowedIds || allowedIds.includes(id))
    : allowedIds;

  if (access.role === "staff" && (!access.kandangIds || access.kandangIds.length === 0)) {
    return NextResponse.json([]);
  }

  if (filteredIds && filteredIds.length === 0) {
    return NextResponse.json([]);
  }

  const kandangRows = filteredIds
    ? await db.select().from(kandangTable).where(inArray(kandangTable.id, filteredIds))
    : await db.select().from(kandangTable);
  const recordingRows = filteredIds
    ? await db.select().from(recordings).where(inArray(recordings.kandangId, filteredIds))
    : await db.select().from(recordings);

  const statuses = buildKandangStatuses(
    kandangRows.map(mapKandang),
    recordingRows.map(mapRecording),
    filters
  );

  return NextResponse.json(buildTopPerformers(statuses, limit));
}
