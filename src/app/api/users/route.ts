import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { getAccessContext, isAdmin } from "@/lib/db/access";

export async function GET() {
  const access = await getAccessContext();
  if (!isAdmin(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await db.select().from(users).orderBy(asc(users.username));
  return NextResponse.json(
    rows.map((row) => ({
      id: row.id,
      username: row.username,
      name: row.name,
      role: row.role,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))
  );
}

export async function POST(request: Request) {
  const access = await getAccessContext();
  if (!isAdmin(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const username = String(body.username || "").trim();
  const name = String(body.name || "").trim();
  const role = body.role === "admin" ? "admin" : "staff";
  const password = String(body.password || "").trim();

  if (!username || !name || !password) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const existing = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [created] = await db.insert(users).values({
    id: randomUUID(),
    username,
    name,
    role,
    passwordHash,
  }).returning();

  return NextResponse.json({
    id: created.id,
    username: created.username,
    name: created.name,
    role: created.role,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  });
}
