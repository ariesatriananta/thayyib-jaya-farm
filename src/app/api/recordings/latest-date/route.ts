import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recordings } from "@/lib/db/schema";
import { desc, inArray } from "drizzle-orm";
import { getAccessContext } from "@/lib/db/access";

export async function GET(request: Request) {
  const access = await getAccessContext();
  const { searchParams } = new URL(request.url);
  const kandangIdsParam = searchParams.get("kandangIds");
  const requestedIds = kandangIdsParam
    ? kandangIdsParam.split(",").map((id) => id.trim()).filter(Boolean)
    : null;

  const allowedIds = access.role === "staff"
    ? (access.kandangIds || [])
    : null;
  const filteredIds = requestedIds
    ? requestedIds.filter((id) => !allowedIds || allowedIds.includes(id))
    : allowedIds;
  if (access.role === "staff") {
    if (!access.kandangIds || access.kandangIds.length === 0) {
      return NextResponse.json({ date: null });
    }
  }

  if (filteredIds && filteredIds.length === 0) {
    return NextResponse.json({ date: null });
  }

  const rows = filteredIds
    ? await db
        .select({ date: recordings.date })
        .from(recordings)
        .where(inArray(recordings.kandangId, filteredIds))
        .orderBy(desc(recordings.date))
        .limit(1)
    : await db
        .select({ date: recordings.date })
        .from(recordings)
        .orderBy(desc(recordings.date))
        .limit(1);

  return NextResponse.json({ date: rows.length ? rows[0].date : null });
}
