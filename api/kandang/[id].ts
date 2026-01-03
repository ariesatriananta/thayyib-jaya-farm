import { z } from "zod";
import {
  deleteKandang,
  findKandangById,
  updateKandang,
} from "../../db/repositories/kandangRepo.ts";
import { error, json, methodNotAllowed, handleOptions } from "../_utils.ts";

const idSchema = z.string().uuid();

const kandangUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    initialChickenCount: z.number().int().nonnegative().optional(),
    targetHDPPercent: z.number().nonnegative().optional(),
    targetFCR: z.number().nonnegative().optional(),
    status: z.enum(["active", "inactive"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;
  try {
    const id = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id;
    const idParsed = idSchema.safeParse(id);
    if (!idParsed.success) {
      return error(res, 400, "Invalid id");
    }

    if (req.method === "GET") {
      const data = await findKandangById(idParsed.data);
      if (!data) {
        return error(res, 404, "Not found");
      }
      return json(res, 200, { ok: true, data });
    }

    if (req.method === "PUT") {
      const parsed = kandangUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return error(res, 400, "Invalid payload", parsed.error.flatten());
      }
      const updated = await updateKandang(idParsed.data, parsed.data);
      if (!updated) {
        return error(res, 404, "Not found");
      }
      return json(res, 200, { ok: true, data: updated });
    }

    if (req.method === "DELETE") {
      const deleted = await deleteKandang(idParsed.data);
      if (!deleted) {
        return error(res, 404, "Not found");
      }
      return json(res, 200, { ok: true, data: deleted });
    }

    return methodNotAllowed(res, ["GET", "PUT", "DELETE"]);
  } catch (err) {
    return error(res, 500, "Internal Server Error");
  }
}
