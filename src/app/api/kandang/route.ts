import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { kandang } from "@/lib/db/schema";
import { mapKandang } from "@/lib/db/mappers";
import { asc, inArray } from "drizzle-orm";
import { getAccessContext, isAdmin } from "@/lib/db/access";

export async function GET() {
  const access = await getAccessContext();
  if (access.role === "staff") {
    if (!access.kandangIds || access.kandangIds.length === 0) {
      return NextResponse.json([]);
    }
    const rows = await db
      .select()
      .from(kandang)
      .where(inArray(kandang.id, access.kandangIds))
      .orderBy(asc(kandang.name));
    return NextResponse.json(rows.map(mapKandang));
  }

  const rows = await db.select().from(kandang).orderBy(asc(kandang.name));
  return NextResponse.json(rows.map(mapKandang));
}

export async function POST(request: Request) {
  const access = await getAccessContext();
  if (!isAdmin(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const insertValues = {
    id: randomUUID(),
    name: body.name,
    initialChickenCount: body.initialChickenCount,
    targetHDPPercent: body.targetHDPPercent,
    targetFCR: body.targetFCR,
    status: body.status,
    ageReferenceDays: body.ageReferenceDays ?? null,
    ageReferenceDate: body.ageReferenceDate ?? null,
  };

  const [created] = await db.insert(kandang).values(insertValues as any).returning();

  return NextResponse.json(mapKandang(created));
}
