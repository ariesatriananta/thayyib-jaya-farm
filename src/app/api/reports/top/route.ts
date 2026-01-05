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
  const limit = Number(searchParams.get("limit") || 3);

  if (access.role === "staff" && (!access.kandangIds || access.kandangIds.length === 0)) {
    return NextResponse.json([]);
  }

  const kandangRows = access.role === "staff"
    ? await db.select().from(kandangTable).where(inArray(kandangTable.id, access.kandangIds!))
    : await db.select().from(kandangTable);
  const recordingRows = access.role === "staff"
    ? await db.select().from(recordings).where(inArray(recordings.kandangId, access.kandangIds!))
    : await db.select().from(recordings);

  const statuses = buildKandangStatuses(
    kandangRows.map(mapKandang),
    recordingRows.map(mapRecording),
    date
  );

  return NextResponse.json(buildTopPerformers(statuses, limit));
}
