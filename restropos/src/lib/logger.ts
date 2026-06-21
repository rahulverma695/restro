import { basePrisma } from "./prisma";

/**
 * Logs an error to the database ErrorLog table and to console.
 * Never throws — a logger must never crash the caller.
 */
export async function logError(
  endpoint: string,
  method: string,
  statusCode: number,
  message?: string
): Promise<void> {
  // Always log to console for Vercel log drain
  console.error(
    JSON.stringify({ level: "error", endpoint, method, statusCode, message, ts: new Date().toISOString() })
  );

  // Persist to DB for the ops dashboard
  try {
    await basePrisma.errorLog.create({
      data: { endpoint, method, statusCode, message: message ?? null },
    });
  } catch {
    // Swallow DB write failures — the logger must never cause a secondary error
  }
}

/**
 * Logs an info-level event to console only (no DB write for non-errors).
 */
export function logInfo(message: string, context?: Record<string, unknown>): void {
  console.log(
    JSON.stringify({ level: "info", message, ...context, ts: new Date().toISOString() })
  );
}
