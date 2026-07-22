import type { RequestHandler } from "express";
import { pool } from "@workspace/db";

/**
 * Fixed-window rate limiter keyed by client IP, backed by the shared
 * Postgres database so the limit stays accurate when the app runs on
 * multiple instances (e.g. autoscale deployments).
 *
 * The counter update is a single atomic upsert: whichever instance handles
 * the request increments the same shared bucket, so concurrent requests
 * can never each get their own allowance.
 */
export function rateLimit({
  windowMs,
  max,
  keyGenerator,
}: {
  windowMs: number;
  max: number;
  /**
   * Derives the bucket key from the request. Defaults to the client IP.
   * Return null to skip rate limiting for this request (e.g. no email in
   * the body — validation will reject it anyway).
   */
  keyGenerator?: (req: Parameters<RequestHandler>[0]) => string | null;
}): RequestHandler {
  // Periodically drop expired buckets so the table doesn't grow unbounded.
  const cleanup = setInterval(() => {
    pool
      .query("DELETE FROM rate_limit_buckets WHERE reset_at <= $1", [
        Date.now(),
      ])
      .catch(() => {
        // Best-effort maintenance; expired rows are also overwritten on hit.
      });
  }, windowMs);
  cleanup.unref?.();

  return async (req, res, next) => {
    const key = keyGenerator
      ? keyGenerator(req)
      : `ip:${req.ip ?? "unknown"}`;
    if (key === null) {
      next();
      return;
    }
    const now = Date.now();

    try {
      const result = await pool.query<{ count: number }>(
        `INSERT INTO rate_limit_buckets (key, count, reset_at)
         VALUES ($1, 1, $2)
         ON CONFLICT (key) DO UPDATE SET
           count = CASE
             WHEN rate_limit_buckets.reset_at <= $3 THEN 1
             ELSE rate_limit_buckets.count + 1
           END,
           reset_at = CASE
             WHEN rate_limit_buckets.reset_at <= $3 THEN $2
             ELSE rate_limit_buckets.reset_at
           END
         RETURNING count`,
        [key, now + windowMs, now],
      );

      const count = Number(result.rows[0]!.count);
      if (count > max) {
        res.status(429).json({
          error: "Too many requests. Please try again in a few minutes.",
        });
        return;
      }
      next();
    } catch (err) {
      // Fail loudly rather than silently letting requests through.
      next(err);
    }
  };
}
