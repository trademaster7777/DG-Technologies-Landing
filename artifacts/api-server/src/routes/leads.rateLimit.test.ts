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

vi.mock("@workspace/db", () => ({
  db: { insert: insertMock },
  leadsTable: {},
}));

vi.mock("../lib/mailer", () => ({
  sendLeadNotification: vi.fn().mockResolvedValue("email-id"),
  sendVisitorConfirmation: vi.fn().mockResolvedValue("email-id"),
}));

const { default: app } = await import("../app");

const validBody = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "555-123-4567",
  message: "Please call me",
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
      message: validBody.message,
      createdAt: new Date(),
    },
  ]);
});

afterAll(() => {
  vi.useRealTimers();
});

describe("POST /api/leads rate limiting", () => {
  it("allows 5 rapid submissions from one IP, rejects the 6th with 429, then resets after the window", async () => {
    // First 5 submissions in the window succeed
    for (let i = 1; i <= 5; i++) {
      const res = await request(app).post("/api/leads").send(validBody);
      expect(res.status, `submission #${i} should succeed`).toBe(201);
    }

    // 6th rapid submission from the same IP is rejected
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
});
