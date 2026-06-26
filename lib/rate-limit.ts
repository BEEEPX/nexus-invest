import { LRUCache } from 'lru-cache';

type RateLimitEntry = { count: number; resetAt: number };

function createRateLimiter(maxTokens: number, windowMs: number) {
  const cache = new LRUCache<string, RateLimitEntry>({
    max: 10_000,
    ttl: windowMs,
  });

  return {
    check(
      limit: number,
      token: string,
    ): { success: boolean; remaining: number; resetAt: number } {
      const now = Date.now();
      const existing = cache.get(token);

      if (!existing || now > existing.resetAt) {
        const entry: RateLimitEntry = { count: 1, resetAt: now + windowMs };
        cache.set(token, entry);
        return { success: true, remaining: limit - 1, resetAt: entry.resetAt };
      }

      if (existing.count >= limit) {
        return { success: false, remaining: 0, resetAt: existing.resetAt };
      }

      existing.count += 1;
      return { success: true, remaining: limit - existing.count, resetAt: existing.resetAt };
    },
  };
}

export const apiLimiter = createRateLimiter(10_000, 60_000);
export const translateLimiter = createRateLimiter(10_000, 60_000);
