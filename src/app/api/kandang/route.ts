import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { kandang } from "@/lib/db/schema";
import { mapKandang } from "@/lib/db/mappers";
import { asc } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(kandang).orderBy(asc(kandang.name));
  return NextResponse.json(rows.map(mapKandang));
}

export async function POST(request: Request) {
  const body = await request.json();
  const now = new Date().toISOString();

  const [created] = await db.insert(kandang).values({
    id: randomUUID(),
    name: body.name,
    initialChickenCount: body.initialChickenCount,
    targetHDPPercent: body.targetHDPPercent,
    targetFCR: body.targetFCR,
    status: body.status,
    createdAt: now,
    updatedAt: now,
  }).returning();

  return NextResponse.json(mapKandang(created));
}
