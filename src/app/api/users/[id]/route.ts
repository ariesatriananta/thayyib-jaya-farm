import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { staffKandangAccess, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAccessContext, isAdmin } from "@/lib/db/access";

interface RouteParams {
  params: { id: string };
}

export async function GET(_: Request, { params }: RouteParams) {
  const access = await getAccessContext();
  if (!access.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (access.role !== "admin" && access.userId !== params.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await db.select().from(users).where(eq(users.id, params.id)).limit(1);
  if (rows.length === 0) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    id: rows[0].id,
    username: rows[0].username,
    name: rows[0].name,
    role: rows[0].role,
    createdAt: rows[0].createdAt,
    updatedAt: rows[0].updatedAt,
  });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const access = await getAccessContext();
  if (!isAdmin(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (access.userId === params.id) {
    return NextResponse.json({ error: "Tidak bisa edit diri sendiri" }, { status: 403 });
  }

  const body = await request.json();
  const name = String(body.name || "").trim();
  const role = body.role === "admin" ? "admin" : "staff";

  if (!name) {
    return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
  }

  const [updated] = await db
    .update(users)
    .set({ name, role })
    .where(eq(users.id, params.id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  if (role === "admin") {
    await db.delete(staffKandangAccess).where(eq(staffKandangAccess.userId, params.id));
  }

  return NextResponse.json({
    id: updated.id,
    username: updated.username,
    name: updated.name,
    role: updated.role,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  });
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const access = await getAccessContext();
  if (!isAdmin(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (access.userId === params.id) {
    return NextResponse.json({ error: "Tidak bisa hapus diri sendiri" }, { status: 403 });
  }

  await db.delete(staffKandangAccess).where(eq(staffKandangAccess.userId, params.id));
  await db.delete(users).where(eq(users.id, params.id));
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const access = await getAccessContext();
  if (!access.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const isSelf = access.userId === params.id;
  if (!isSelf && !isAdmin(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : null;
  const password = typeof body.password === "string" ? body.password.trim() : null;

  if (name !== null && name.length === 0) {
    return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
  }

  if (password !== null && password.length < 6) {
    return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
  }

  if (!name && !password) {
    return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
  }

  const updates: { name?: string; passwordHash?: string } = {};
  if (name) {
    updates.name = name;
  }

  if (password) {
    const bcrypt = await import("bcrypt");
    updates.passwordHash = await bcrypt.default.hash(password, 10);
  }

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, params.id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    id: updated.id,
    username: updated.username,
    name: updated.name,
    role: updated.role,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  });
}
