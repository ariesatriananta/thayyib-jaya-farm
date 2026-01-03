import { z } from "zod";
import {
  createKandang,
  findAllKandang,
} from "../db/repositories/kandangRepo.ts";
import { error, json, methodNotAllowed, handleOptions } from "./_utils.ts";

const kandangCreateSchema = z.object({
  name: z.string().min(1),
  initialChickenCount: z.number().int().nonnegative(),
  targetHDPPercent: z.number().nonnegative(),
  targetFCR: z.number().nonnegative(),
  status: z.enum(["active", "inactive"]),
});

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;
  try {
    if (req.method === "GET") {
      const data = await findAllKandang();
      return json(res, 200, { ok: true, data });
    }

    if (req.method === "POST") {
      const parsed = kandangCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return error(res, 400, "Invalid payload", parsed.error.flatten());
      }
      const created = await createKandang(parsed.data);
      return json(res, 201, { ok: true, data: created });
    }

    return methodNotAllowed(res, ["GET", "POST"]);
  } catch (err) {
    return error(res, 500, "Internal Server Error");
  }
}
