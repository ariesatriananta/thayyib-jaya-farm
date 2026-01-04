import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { kandang as kandangTable, recordings } from "@/lib/db/schema";
import { mapKandang, mapRecording } from "@/lib/db/mappers";
import { buildDashboardSummary } from "@/lib/reporting";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || undefined;

  const kandangRows = await db.select().from(kandangTable);
  const recordingRows = await db.select().from(recordings);

  const summary = buildDashboardSummary(
    kandangRows.map(mapKandang),
    recordingRows.map(mapRecording),
    date
  );

  return NextResponse.json(summary);
}
