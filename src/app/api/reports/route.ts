import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { kandang as kandangTable, recordings } from "@/lib/db/schema";
import { mapKandang, mapRecording } from "@/lib/db/mappers";
import { buildReportData } from "@/lib/reporting";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const kandangId = searchParams.get("kandangId") || "all";

  if (!startDate || !endDate) {
    return NextResponse.json({ dailyMetrics: [], trendData: [], ranking: [] });
  }

  const kandangRows = await db.select().from(kandangTable);
  const recordingRows = await db.select().from(recordings);

  const data = buildReportData(
    recordingRows.map(mapRecording),
    kandangRows.map(mapKandang),
    { startDate, endDate, kandangId }
  );

  return NextResponse.json(data);
}
