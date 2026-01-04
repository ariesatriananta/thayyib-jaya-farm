import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { kandang } from "@/lib/db/schema";
import { mapKandang } from "@/lib/db/mappers";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select()
    .from(kandang)
    .where(eq(kandang.status, "active"))
    .orderBy(asc(kandang.name));

  return NextResponse.json(rows.map(mapKandang));
}
