import { z } from "zod";
import {
  deleteRecording,
  findRecordingById,
  updateRecording,
} from "../../db/repositories/recordingsRepo.ts";
import { error, json, methodNotAllowed, handleOptions } from "../_utils.ts";

const idSchema = z.string().uuid();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const recordingUpdateSchema = z
  .object({
    kandangId: z.string().uuid().optional(),
    date: dateSchema.optional(),
    feedInKg: z.number().nonnegative().optional(),
    feedRemainingKg: z.number().nonnegative().optional(),
    feedUsedKg: z.number().nonnegative().optional(),
    eggsKg: z.number().nonnegative().optional(),
    eggsCount: z.number().int().nonnegative().optional(),
    deadChickenCount: z.number().int().nonnegative().optional(),
    notes: z.string().optional(),
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
      const data = await findRecordingById(idParsed.data);
      if (!data) {
        return error(res, 404, "Not found");
      }
      return json(res, 200, { ok: true, data });
    }

    if (req.method === "PUT") {
      const parsed = recordingUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return error(res, 400, "Invalid payload", parsed.error.flatten());
      }
      const updated = await updateRecording(idParsed.data, parsed.data);
      if (!updated) {
        return error(res, 404, "Not found");
      }
      return json(res, 200, { ok: true, data: updated });
    }

    if (req.method === "DELETE") {
      const deleted = await deleteRecording(idParsed.data);
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
