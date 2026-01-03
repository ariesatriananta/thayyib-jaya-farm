import { z } from "zod";
import {
  deleteSettings,
  findSettingsById,
  updateSettings,
} from "../../db/repositories/settingsRepo.ts";
import { error, json, methodNotAllowed, handleOptions } from "../_utils.ts";

const idSchema = z.string().uuid();

const settingsUpdateSchema = z
  .object({
    farmName: z.string().min(1).optional(),
    defaultTargetHDPPercent: z.number().nonnegative().optional(),
    defaultTargetFCR: z.number().nonnegative().optional(),
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
      const data = await findSettingsById(idParsed.data);
      if (!data) {
        return error(res, 404, "Not found");
      }
      return json(res, 200, { ok: true, data });
    }

    if (req.method === "PUT") {
      const parsed = settingsUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return error(res, 400, "Invalid payload", parsed.error.flatten());
      }
      const updated = await updateSettings(idParsed.data, parsed.data);
      if (!updated) {
        return error(res, 404, "Not found");
      }
      return json(res, 200, { ok: true, data: updated });
    }

    if (req.method === "DELETE") {
      const deleted = await deleteSettings(idParsed.data);
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
