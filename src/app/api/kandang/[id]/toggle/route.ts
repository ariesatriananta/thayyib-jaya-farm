import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { kandang } from "@/lib/db/schema";
import { mapKandang } from "@/lib/db/mappers";
import { eq } from "drizzle-orm";
import { getAccessContext, isAdmin } from "@/lib/db/access";

interface RouteParams {
  params: { id: string };
}

export async function POST(_: Request, { params }: RouteParams) {
  const access = await getAccessContext();
  if (!isAdmin(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await db.select().from(kandang).where(eq(kandang.id, params.id)).limit(1);
  if (rows.length === 0) {
    return NextResponse.json(null);
  }

  const now = new Date().toISOString();
  const nextStatus = rows[0].status === "active" ? "inactive" : "active";

  const [updated] = await db
    .update(kandang)
    .set({ status: nextStatus })
    .where(eq(kandang.id, params.id))
    .returning();

  return NextResponse.json(updated ? mapKandang(updated) : null);
}
