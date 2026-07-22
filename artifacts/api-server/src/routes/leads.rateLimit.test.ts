import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import request from "supertest";

// Fake only Date so supertest/http keep working with real timers. The rate
// limiter windows are driven by Date.now(), so this is all we need to
// control the fixed window.
vi.useFakeTimers({ toFake: ["Date"] });
vi.setSystemTime(new Date("2026-07-22T12:00:00Z"));

// Mock the db package before importing the app: the real module opens a
// Postgres pool at import time and requires DATABASE_URL.
const returningMock = vi.fn();
const valuesMock = vi.fn(() => ({ returning: returningMock }));
const insertMock = vi.fn(() => ({ values: valuesMock }));

// In-memory model of the shared rate_limit_buckets table. It faithfully
// mirrors the atomic upsert the limiter issues against Postgres.
const buckets = new Map<string, { count: number; resetAt: number }>();
const queryMock = vi.fn(async (text: string, params: unknown[]) => {
  if (text.startsWith("DELETE")) {
    const now = params[0] as number;
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    return { rows: [] };
  }
  const [key, resetAt, now] = params as [string, number, number];
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt });
    return { rows: [{ count: 1 }] };
  }
  bucket.count += 1;
  return { rows: [{ count: bucket.count }] };
});

vi.mock("@workspace/db", () => ({
  db: { insert: insertMock },
  pool: { query: queryMock },
  leadsTable: {},
}));

vi.mock("../lib/mailer", () => ({
  sendLeadNotification: vi.fn().mockResolvedValue("email-id"),
  sendVisitorConfirmation: vi.fn().mockResolvedValue("email-id"),
}));

// Mock Turnstile verification: always passes here — the bot challenge has
// its own coverage in leads.test.ts, and these tests target rate limiting.
vi.mock("../lib/turnstile", () => ({
  verifyTurnstileToken: vi.fn(async () => ({ outcome: "pass" })),
  usingTestTurnstileKeys: () => true,
}));

const { default: app } = await import("../app");

const validBody = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "555-123-4567",
  message: "Please call me",
  turnstileToken: "test-turnstile-token",
};

beforeEach(() => {
  returningMock.mockResolvedValue([
    {
      id: 1,
      name: validBody.name,
      email: validBody.email,
      phone: validBody.phone,
      businessName: null,
      packageInterest: null,
      preferredTime: null,
      preferredDate: null,
      preferredSlot: null,
      message: validBody.message,
      createdAt: new Date(),
    },
  ]);
});

afterAll(() => {
  vi.useRealTimers();
});

describe("POST /api/leads rate limiting", () => {
  beforeEach(() => {
    buckets.clear();
  });

  it("allows 5 rapid submissions from one email, rejects the 6th with 429, then resets after the window", async () => {
    // First 5 submissions in the window succeed
    for (let i = 1; i <= 5; i++) {
      const res = await request(app).post("/api/leads").send(validBody);
      expect(res.status, `submission #${i} should succeed`).toBe(201);
    }

    // 6th rapid submission with the same email is rejected
    const blocked = await request(app).post("/api/leads").send(validBody);
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toMatch(/too many requests/i);

    // Still blocked just before the 10-minute window expires
    vi.advanceTimersByTime(10 * 60 * 1000 - 1);
    const stillBlocked = await request(app).post("/api/leads").send(validBody);
    expect(stillBlocked.status).toBe(429);

    // Once the window expires, submissions are accepted again
    vi.advanceTimersByTime(2);
    const afterReset = await request(app).post("/api/leads").send(validBody);
    expect(afterReset.status).toBe(201);
  });

  it("does not block other visitors on the same IP when one email hits its limit", async () => {
    // One coworker exhausts their per-email allowance
    for (let i = 1; i <= 5; i++) {
      const res = await request(app).post("/api/leads").send(validBody);
      expect(res.status).toBe(201);
    }
    const blocked = await request(app).post("/api/leads").send(validBody);
    expect(blocked.status).toBe(429);

    // A different visitor behind the same IP still gets through
    const other = await request(app)
      .post("/api/leads")
      .send({ ...validBody, email: "colleague@example.com" });
    expect(other.status).toBe(201);
  });

  it("still caps total submissions per IP at 20 per window", async () => {
    // 20 submissions from unique emails all succeed
    for (let i = 1; i <= 20; i++) {
      const res = await request(app)
        .post("/api/leads")
        .send({ ...validBody, email: `visitor${i}@example.com` });
      expect(res.status, `submission #${i} should succeed`).toBe(201);
    }

    // The 21st from the same IP is rejected even with a fresh email
    const blocked = await request(app)
      .post("/api/leads")
      .send({ ...validBody, email: "visitor21@example.com" });
    expect(blocked.status).toBe(429);
  });
});
