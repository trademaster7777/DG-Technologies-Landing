import { pgTable, text, integer, bigint } from "drizzle-orm/pg-core";

/**
 * Fixed-window rate limit counters shared across all server instances.
 * `resetAt` is a Unix epoch in milliseconds marking the end of the window.
 */
export const rateLimitBucketsTable = pgTable("rate_limit_buckets", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  resetAt: bigint("reset_at", { mode: "number" }).notNull(),
});

export type RateLimitBucket = typeof rateLimitBucketsTable.$inferSelect;
