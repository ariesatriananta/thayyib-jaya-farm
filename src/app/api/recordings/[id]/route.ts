import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recordings } from "@/lib/db/schema";
import { mapRecording } from "@/lib/db/mappers";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: { id: string };
}

export async function GET(_: Request, { params }: RouteParams) {
  const rows = await db.select().from(recordings).where(eq(recordings.id, params.id)).limit(1);
  if (rows.length === 0) {
    return NextResponse.json(null);
  }
  return NextResponse.json(mapRecording(rows[0]));
}

export async function PUT(request: Request, { params }: RouteParams) {
  const body = await request.json();
  const now = new Date().toISOString();
  const existingRows = await db.select().from(recordings).where(eq(recordings.id, params.id)).limit(1);
  if (existingRows.length === 0) {
    return NextResponse.json(null);
  }

  const existing = existingRows[0];
  const feedInKg = body.feedInKg ?? existing.feedInKg;
  const feedRemainingKg = body.feedRemainingKg ?? existing.feedRemainingKg;
  const feedUsedKg = Math.max(0, feedInKg - feedRemainingKg);

  const [updated] = await db
    .update(recordings)
    .set({
      ...body,
      feedInKg,
      feedRemainingKg,
      feedUsedKg,
      updatedAt: now,
    })
    .where(eq(recordings.id, params.id))
    .returning();

  return NextResponse.json(updated ? mapRecording(updated) : null);
}

export async function DELETE(_: Request, { params }: RouteParams) {
  await db.delete(recordings).where(eq(recordings.id, params.id));
  return NextResponse.json({ success: true });
}
