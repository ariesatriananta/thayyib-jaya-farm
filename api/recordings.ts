import { z } from "zod";
import {
  createRecording,
  findAllRecordings,
  findRecordingsByDate,
  findRecordingsByDateRange,
} from "../db/repositories/recordingsRepo.ts";
import { error, json, methodNotAllowed, handleOptions } from "./_utils.ts";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const recordingCreateSchema = z.object({
  kandangId: z.string().uuid(),
  date: dateSchema,
  feedInKg: z.number().nonnegative(),
  feedRemainingKg: z.number().nonnegative(),
  feedUsedKg: z.number().nonnegative(),
  eggsKg: z.number().nonnegative(),
  eggsCount: z.number().int().nonnegative(),
  deadChickenCount: z.number().int().nonnegative(),
  notes: z.string().optional().default(""),
});

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;
  try {
    if (req.method === "GET") {
      const date = req.query?.date;
      const from = req.query?.from;
      const to = req.query?.to;
      const kandangId = req.query?.kandangId;

      if (typeof date === "string") {
        const parsed = dateSchema.safeParse(date);
        if (!parsed.success) {
          return error(res, 400, "Invalid date");
        }
        const data = await findRecordingsByDate(parsed.data, kandangId);
        return json(res, 200, { ok: true, data });
      }

      if (typeof from === "string" && typeof to === "string") {
        const fromParsed = dateSchema.safeParse(from);
        const toParsed = dateSchema.safeParse(to);
        if (!fromParsed.success || !toParsed.success) {
          return error(res, 400, "Invalid date range");
        }
        const data = await findRecordingsByDateRange(
          fromParsed.data,
          toParsed.data,
          kandangId
        );
        return json(res, 200, { ok: true, data });
      }

      const data = await findAllRecordings();
      return json(res, 200, { ok: true, data });
    }

    if (req.method === "POST") {
      const parsed = recordingCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return error(res, 400, "Invalid payload", parsed.error.flatten());
      }
      const created = await createRecording(parsed.data);
      return json(res, 201, { ok: true, data: created });
    }

    return methodNotAllowed(res, ["GET", "POST"]);
  } catch (err) {
    return error(res, 500, "Internal Server Error");
  }
}
