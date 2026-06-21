import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Singleton instances keyed by config string
const limiters = new Map<string, Ratelimit>();

function getLimiter(requests: number, window: string): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Graceful no-op when Upstash is not configured.
    // Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars to enable.
    return null;
  }
  const key = `${requests}:${window}`;
  if (!limiters.has(key)) {
    limiters.set(key, new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(requests, window as Parameters<typeof Ratelimit.slidingWindow>[1]),
      analytics: false,
    }));
  }
  return limiters.get(key)!;
}

/**
 * Check rate limit for an identifier (typically an IP address).
 * Returns { allowed: true } when Upstash is not configured (graceful no-op).
 * Returns { allowed: false, retryAfter: number } when limit is exceeded.
 */
export async function checkRateLimit(
  identifier: string,
  requests = 10,
  window = "1 m"
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const limiter = getLimiter(requests, window);
  if (!limiter) return { allowed: true };

  const { success, reset } = await limiter.limit(identifier);
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return { allowed: false, retryAfter };
  }
  return { allowed: true };
}

/** Extracts IP from a Next.js Request for use as rate limit identifier. */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}
