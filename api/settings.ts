import { z } from "zod";
import {
  createSettings,
  findAllSettings,
} from "../db/repositories/settingsRepo.ts";
import { error, json, methodNotAllowed, handleOptions } from "./_utils.ts";

const settingsCreateSchema = z.object({
  farmName: z.string().min(1),
  defaultTargetHDPPercent: z.number().nonnegative(),
  defaultTargetFCR: z.number().nonnegative(),
});

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;
  try {
    if (req.method === "GET") {
      const data = await findAllSettings();
      return json(res, 200, { ok: true, data });
    }

    if (req.method === "POST") {
      const parsed = settingsCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return error(res, 400, "Invalid payload", parsed.error.flatten());
      }
      const created = await createSettings(parsed.data);
      return json(res, 201, { ok: true, data: created });
    }

    return methodNotAllowed(res, ["GET", "POST"]);
  } catch (err) {
    return error(res, 500, "Internal Server Error");
  }
}
