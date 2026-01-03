import { sql } from "drizzle-orm";
import { db } from "../db/index.ts";

import { applyCors } from "./_utils.ts";

export default async function handler(_req: any, res: any) {
  try {
    applyCors(res);
    if (!db) {
      return res.status(500).json({ ok: false, db: "not_configured" });
    }
    await db.execute(sql`SELECT 1`);
    res.status(200).json({ ok: true, db: "connected" });
  } catch (error) {
    res.status(500).json({ ok: false, db: "error" });
  }
}
