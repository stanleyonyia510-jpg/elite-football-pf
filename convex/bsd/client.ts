// Shared server-side client for the Bzzoiro Sports Data (BSD) football API.
// NEVER call this from the frontend. All requests happen inside Convex actions
// so the API key stays server-side.
import { ConvexError } from "convex/values";

const BASE_URL = "https://sports.bzzoiro.com/api/v2";

// Read an environment variable without depending on ambient Node types -
// this file is transitively imported by the generated api object, which
// the frontend's TypeScript project also type-checks (and that project has
// no Node type definitions).
function getEnvVar(key: string): string | undefined {
  const globalWithProcess = globalThis as unknown as {
    process?: { env?: Record<string, string | undefined> };
  };
  return globalWithProcess.process?.env?.[key]…
[8:35 AM, 9/15/2026] CHIMEE: // Shared server-side client for the Bzzoiro Sports Data (BSD) football API.
import { ConvexError } from "convex/values";

// FIXED: Changed URL from sports.bzzoiro.com to api.bzzoiro.com
const BASE_URL = "https://api.bzzoiro.com/v2";

function getEnvVar(key: string): string | undefined {
  const globalWithProcess = globalThis as unknown as {
    process?: { env?: Record<string, string | undefined> };
  };
  return globalWithProcess.process?.env?.[key];
}

export class BsdApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]:…
[9:16 AM, 9/15/2026] CHIMEE: // Shared server-side client for the Bzzoiro Sports Data (BSD) football API.
import { ConvexError } from "convex/values";

// FIXED: Changed URL from sports.bzzoiro.com to api.bzzoiro.com
const BASE_URL = "https://api.bzzoiro.com/v2";

function getEnvVar(key: string): string | undefined {
  const globalWithProcess = globalThis as unknown as {
    process?: { env?: Record<string, string | undefined> };
  };
  return globalWithProcess.process?.env?.[key];
}

export class BsdApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

export async function bsdGet(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<Json> {
  const apiKey = getEnvVar("BZZOIRO_API_KEY");
  if (!apiKey) {
    throw new ConvexError({
      code: "EXTERNAL_SERVICE_ERROR",
      message:
        "Bzzoiro API key is not configured. Add BZZOIRO_API_KEY in the Secrets tab.",
    });
  }

  const url = new URL(${BASE_URL}${path});
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: { Authorization: Token ${apiKey} },
    });
  } catch {
    throw new BsdApiError(
      "Could not reach the football data provider. Please try again.",
      0,
      "network_failure",
    );
  }

  if (!response.ok) {
    let code = http_${response.status};
    try {
      const body = (await response.json()) as { code?: string; detail?: string };
      if (body.code) code = body.code;
    } catch {
      // ignore, keep default code
    }

    const friendly: Record<number, string> = {
      401: "Football data provider rejected the API key.",
      402: "This data requires a paid Bzzoiro add-on.",
      403: "This data isn't included in the current Bzzoiro plan.",
      404: "That item could not be found.",
      429: "Too many requests to the football data provider. Please wait a moment.",
    };

    throw new BsdApiError(
      friendly[response.status] ?? "The football data provider returned an error.",
      response.status,
      code,
    );
  }

  return (await response.json()) as Json;
}
