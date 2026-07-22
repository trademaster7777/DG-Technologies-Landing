import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";

// Mock the db package before importing the app: the real module opens a
// Postgres pool at import time and requires DATABASE_URL.
const returningMock = vi.fn();
const whereMock = vi.fn(() => ({ returning: returningMock }));
const setMock = vi.fn(() => ({ where: whereMock }));
const updateMock = vi.fn(() => ({ set: setMock }));

vi.mock("@workspace/db", () => ({
  db: { update: updateMock },
  pool: { query: vi.fn(async () => ({ rows: [{ count: 1 }] })) },
  leadsTable: {},
}));

vi.mock("../lib/mailer", () => ({
  sendLeadNotification: vi.fn(),
  sendVisitorConfirmation: vi.fn(),
}));

const { default: app } = await import("../app");

const TOKEN = "test-admin-token";

function releasedLead(overrides: Record<string, unknown> = {}) {
  return {
    id: 42,
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "555-123-4567",
    businessName: null,
    packageInterest: null,
    preferredTime: null,
    preferredDate: null,
    preferredSlot: null,
    message: null,
    createdAt: new Date("2026-07-22T00:00:00Z"),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.ADMIN_TOKEN = TOKEN;
  returningMock.mockResolvedValue([releasedLead()]);
});

afterEach(() => {
  delete process.env.ADMIN_TOKEN;
});

describe("DELETE /api/leads/:id/booking", () => {
  it("returns 503 when ADMIN_TOKEN is not configured", async () => {
    delete process.env.ADMIN_TOKEN;
    const res = await request(app).delete("/api/leads/42/booking");
    expect(res.status).toBe(503);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 401 without a valid admin token", async () => {
    const missing = await request(app).delete("/api/leads/42/booking");
    expect(missing.status).toBe(401);

    const wrong = await request(app)
      .delete("/api/leads/42/booking")
      .set("x-admin-token", "nope");
    expect(wrong.status).toBe(401);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 400 for a non-numeric id", async () => {
    const res = await request(app)
      .delete("/api/leads/abc/booking")
      .set("x-admin-token", TOKEN);
    expect(res.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 404 when the lead has no booking", async () => {
    returningMock.mockResolvedValue([]);
    const res = await request(app)
      .delete("/api/leads/42/booking")
      .set("x-admin-token", TOKEN);
    expect(res.status).toBe(404);
  });

  it("clears the booking and returns the updated lead", async () => {
    const res = await request(app)
      .delete("/api/leads/42/booking")
      .set("x-admin-token", TOKEN);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(42);
    expect(res.body.preferredDate).toBeNull();
    expect(res.body.preferredSlot).toBeNull();
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(setMock).toHaveBeenCalledWith({
      preferredDate: null,
      preferredSlot: null,
    });
  });
});
