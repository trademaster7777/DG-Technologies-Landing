import type { RequestHandler } from "express";

type Bucket = { count: number; resetAt: number };

/**
 * Minimal fixed-window in-memory rate limiter, keyed by client IP.
 * Suitable for a single-process server; swap for a shared store if
 * the app is ever scaled horizontally.
 */
export function rateLimit({
  windowMs,
  max,
}: {
  windowMs: number;
  max: number;
}): RequestHandler {
  const buckets = new Map<string, Bucket>();

  // Periodically drop expired buckets so the map doesn't grow unbounded.
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, windowMs);
  cleanup.unref?.();

  return (req, res, next) => {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (bucket.count >= max) {
      res
        .status(429)
        .json({ error: "Too many requests. Please try again in a few minutes." });
      return;
    }

    bucket.count += 1;
    next();
  };
}
