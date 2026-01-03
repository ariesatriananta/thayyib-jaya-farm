const allowedOrigins = new Set(["http://localhost:8080", "http://127.0.0.1:8080"]);

export function applyCors(res: any) {
  const origin = res?.req?.headers?.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export function handleOptions(req: any, res: any) {
  if (req.method === "OPTIONS") {
    applyCors(res);
    res.status(204).end();
    return true;
  }
  return false;
}

export function json(res: any, status: number, data: unknown) {
  applyCors(res);
  res.status(status).json(data);
}

export function error(res: any, status: number, message: string, details?: unknown) {
  applyCors(res);
  const payload: { ok: false; message: string; details?: unknown } = {
    ok: false,
    message,
  };
  if (details !== undefined) {
    payload.details = details;
  }
  res.status(status).json(payload);
}

export function methodNotAllowed(res: any, allowed: string[]) {
  applyCors(res);
  res.setHeader("Allow", allowed);
  error(res, 405, "Method Not Allowed");
}
