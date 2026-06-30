import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recordings } from "@/lib/db/schema";
import { mapRecording } from "@/lib/db/mappers";
import { eq } from "drizzle-orm";
import { getAccessContext } from "@/lib/db/access";

interface RouteParams {
  params: { id: string };
}

export async function GET(_: Request, { params }: RouteParams) {
  const access = await getAccessContext();
  const rows = await db.select().from(recordings).where(eq(recordings.id, params.id)).limit(1);
  if (rows.length === 0) {
    return NextResponse.json(null);
  }
  if (access.role === "staff" && !access.kandangIds?.includes(rows[0].kandangId)) {
    return NextResponse.json(null);
  }
  return NextResponse.json(mapRecording(rows[0]));
}

export async function PUT(request: Request, { params }: RouteParams) {
  const access = await getAccessContext();
  const body = await request.json();
  const existingRows = await db.select().from(recordings).where(eq(recordings.id, params.id)).limit(1);
  if (existingRows.length === 0) {
    return NextResponse.json(null);
  }

  const existing = existingRows[0];
  if (access.role === "staff" && !access.kandangIds?.includes(existing.kandangId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const feedInKg = body.feedInKg ?? existing.feedInKg;
  const feedRemainingKg = body.feedRemainingKg ?? existing.feedRemainingKg;
  const feedUsedKg = Math.max(0, feedInKg - feedRemainingKg);
  const feedPriceKg = access.role === "staff"
    ? existing.feedPriceKg
    : body.feedPriceKg ?? existing.feedPriceKg;
  const eggsPriceKg = access.role === "staff"
    ? existing.eggsPriceKg
    : body.eggsPriceKg ?? existing.eggsPriceKg;
  const whiteEggsKg = Math.max(0, Number(body.whiteEggsKg ?? existing.whiteEggsKg ?? 0));
  const whiteEggsCount = Math.max(0, Number(body.whiteEggsCount ?? existing.whiteEggsCount ?? 0));
  const brokenEggsCount = Math.max(0, Number(body.brokenEggsCount ?? existing.brokenEggsCount ?? 0));

  const [updated] = await db
    .update(recordings)
    .set({
      ...body,
      feedInKg,
      feedPriceKg,
      feedRemainingKg,
      feedUsedKg,
      eggsPriceKg,
      whiteEggsKg,
      whiteEggsCount,
      brokenEggsCount,
    })
    .where(eq(recordings.id, params.id))
    .returning();

  return NextResponse.json(updated ? mapRecording(updated) : null);
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const access = await getAccessContext();
  const existingRows = await db.select().from(recordings).where(eq(recordings.id, params.id)).limit(1);
  if (existingRows.length === 0) {
    return NextResponse.json({ success: true });
  }
  if (access.role === "staff" && !access.kandangIds?.includes(existingRows[0].kandangId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(recordings).where(eq(recordings.id, params.id));
  return NextResponse.json({ success: true });
}
