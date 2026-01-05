import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { kandang } from "@/lib/db/schema";
import { mapKandang } from "@/lib/db/mappers";
import { eq } from "drizzle-orm";
import { getAccessContext, isAdmin } from "@/lib/db/access";

interface RouteParams {
  params: { id: string };
}

export async function GET(_: Request, { params }: RouteParams) {
  const access = await getAccessContext();
  if (access.role === "staff") {
    if (!access.kandangIds?.includes(params.id)) {
      return NextResponse.json(null);
    }
  }

  const rows = await db.select().from(kandang).where(eq(kandang.id, params.id)).limit(1);
  if (rows.length === 0) {
    return NextResponse.json(null);
  }
  return NextResponse.json(mapKandang(rows[0]));
}

export async function PUT(request: Request, { params }: RouteParams) {
  const access = await getAccessContext();
  if (!isAdmin(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const [updated] = await db
    .update(kandang)
    .set({
      ...body,
    })
    .where(eq(kandang.id, params.id))
    .returning();

  return NextResponse.json(updated ? mapKandang(updated) : null);
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const access = await getAccessContext();
  if (!isAdmin(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(kandang).where(eq(kandang.id, params.id));
  return NextResponse.json({ success: true });
}
