import { getServerSession } from "next-auth/next";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { staffKandangAccess } from "@/lib/db/schema";

export type AccessContext = {
  role: "admin" | "staff" | null;
  userId: string | null;
  kandangIds: string[] | null;
};

export async function getAccessContext(): Promise<AccessContext> {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? null;
  const userId = session?.user?.id ?? null;

  if (role !== "staff" || !userId) {
    return { role: role ?? null, userId, kandangIds: null };
  }

  const rows = await db
    .select({ kandangId: staffKandangAccess.kandangId })
    .from(staffKandangAccess)
    .where(eq(staffKandangAccess.userId, userId));

  return {
    role,
    userId,
    kandangIds: rows.map((row) => row.kandangId),
  };
}

export function isAdmin(role: AccessContext["role"]): boolean {
  return role === "admin";
}
