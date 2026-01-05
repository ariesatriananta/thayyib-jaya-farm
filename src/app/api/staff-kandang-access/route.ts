import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { kandang, staffKandangAccess, users } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getAccessContext, isAdmin } from "@/lib/db/access";

export async function GET(request: Request) {
  const access = await getAccessContext();
  if (!isAdmin(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (userId) {
    const rows = await db
      .select({ kandangId: staffKandangAccess.kandangId })
      .from(staffKandangAccess)
      .where(eq(staffKandangAccess.userId, userId));
    return NextResponse.json({ userId, kandangIds: rows.map((row) => row.kandangId) });
  }

  const staffUsers = await db.select().from(users).where(eq(users.role, "staff"));
  if (staffUsers.length === 0) {
    return NextResponse.json([]);
  }

  const mappings = await db
    .select()
    .from(staffKandangAccess)
    .where(inArray(staffKandangAccess.userId, staffUsers.map((user) => user.id)));

  const mappingByUser = new Map<string, string[]>();
  mappings.forEach((row) => {
    const list = mappingByUser.get(row.userId) || [];
    list.push(row.kandangId);
    mappingByUser.set(row.userId, list);
  });

  const kandangRows = await db.select().from(kandang);
  const kandangMap = new Map(kandangRows.map((row) => [row.id, row.name]));

  return NextResponse.json(
    staffUsers.map((user) => ({
      userId: user.id,
      username: user.username,
      name: user.name,
      kandangIds: mappingByUser.get(user.id) || [],
      kandangNames: (mappingByUser.get(user.id) || []).map((id) => kandangMap.get(id) || id),
    }))
  );
}

export async function PUT(request: Request) {
  const access = await getAccessContext();
  if (!isAdmin(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const userId = String(body.userId || "").trim();
  const kandangIds = Array.isArray(body.kandangIds) ? body.kandangIds : [];

  if (!userId) {
    return NextResponse.json({ error: "UserId tidak valid" }, { status: 400 });
  }

  const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (userRows.length === 0 || userRows[0].role !== "staff") {
    return NextResponse.json({ error: "User bukan staff" }, { status: 400 });
  }

  await db.delete(staffKandangAccess).where(eq(staffKandangAccess.userId, userId));

  if (kandangIds.length > 0) {
    const now = new Date().toISOString();
    await db.insert(staffKandangAccess).values(
      kandangIds.map((kandangId: string) => ({
        id: randomUUID(),
        userId,
        kandangId,
        createdAt: now,
      }))
    );
  }

  return NextResponse.json({ success: true });
}
