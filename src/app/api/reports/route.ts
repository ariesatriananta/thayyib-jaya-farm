import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { kandang as kandangTable, recordings } from "@/lib/db/schema";
import { mapKandang, mapRecording } from "@/lib/db/mappers";
import { buildReportData } from "@/lib/reporting";
import { getAccessContext } from "@/lib/db/access";
import { inArray } from "drizzle-orm";

export async function GET(request: Request) {
  const access = await getAccessContext();
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const kandangId = searchParams.get("kandangId") || "all";

  if (!startDate || !endDate) {
    return NextResponse.json({ dailyMetrics: [], trendData: [], ranking: [] });
  }

  if (access.role === "staff" && (!access.kandangIds || access.kandangIds.length === 0)) {
    return NextResponse.json({ dailyMetrics: [], trendData: [], ranking: [] });
  }

  if (access.role === "staff" && kandangId !== "all" && !access.kandangIds?.includes(kandangId)) {
    return NextResponse.json({ dailyMetrics: [], trendData: [], ranking: [] });
  }

  const kandangRows = access.role === "staff"
    ? await db.select().from(kandangTable).where(inArray(kandangTable.id, access.kandangIds!))
    : await db.select().from(kandangTable);
  const recordingRows = access.role === "staff"
    ? await db.select().from(recordings).where(inArray(recordings.kandangId, access.kandangIds!))
    : await db.select().from(recordings);

  const data = buildReportData(
    recordingRows.map(mapRecording),
    kandangRows.map(mapKandang),
    { startDate, endDate, kandangId }
  );

  return NextResponse.json(data);
}
