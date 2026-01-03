type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = { ok: false; message: string; details?: unknown };
type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function buildQuery(query?: Record<string, string | number | undefined>) {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { query?: Record<string, string | number | undefined> } = {}
): Promise<T> {
  const query = buildQuery(options.query);
  const baseUrl = import.meta.env.DEV ? "http://127.0.0.1:3001" : "";
  const response = await fetch(`${baseUrl}/api${path}${query}`, {
    ...options,
    credentials: "omit",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload && "message" in payload ? payload.message : "Request failed";
    const details = payload && "details" in payload ? payload.details : undefined;
    throw new ApiError(message, response.status, details);
  }

  if (payload && "ok" in payload && payload.ok === false) {
    throw new ApiError(payload.message, 400, payload.details);
  }

  if (!payload || !("data" in payload)) {
    throw new ApiError("Invalid response", response.status);
  }

  return payload.data;
}
