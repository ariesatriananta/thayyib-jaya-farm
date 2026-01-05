import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { kandang } from "@/lib/db/schema";
import { mapKandang } from "@/lib/db/mappers";
import { and, asc, eq, inArray } from "drizzle-orm";
import { getAccessContext } from "@/lib/db/access";

export async function GET() {
  const access = await getAccessContext();
  const conditions = [eq(kandang.status, "active")];

  if (access.role === "staff") {
    if (!access.kandangIds || access.kandangIds.length === 0) {
      return NextResponse.json([]);
    }
    conditions.push(inArray(kandang.id, access.kandangIds));
  }

  const rows = await db
    .select()
    .from(kandang)
    .where(and(...conditions))
    .orderBy(asc(kandang.name));

  return NextResponse.json(rows.map(mapKandang));
}
