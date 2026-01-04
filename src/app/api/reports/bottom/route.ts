import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { kandang as kandangTable, recordings } from "@/lib/db/schema";
import { mapKandang, mapRecording } from "@/lib/db/mappers";
import { buildKandangStatuses, buildBottomPerformers } from "@/lib/reporting";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || undefined;
  const limit = Number(searchParams.get("limit") || 3);

  const kandangRows = await db.select().from(kandangTable);
  const recordingRows = await db.select().from(recordings);

  const statuses = buildKandangStatuses(
    kandangRows.map(mapKandang),
    recordingRows.map(mapRecording),
    date
  );

  return NextResponse.json(buildBottomPerformers(statuses, limit));
}
