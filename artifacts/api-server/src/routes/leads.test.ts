import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// Mock the db package before importing the app: the real module opens a
// Postgres pool at import time and requires DATABASE_URL.
const insertedRows: unknown[] = [];
const returningMock = vi.fn();
const valuesMock = vi.fn((values: unknown) => {
  insertedRows.push(values);
  return { returning: returningMock };
});
const insertMock = vi.fn(() => ({ values: valuesMock }));

vi.mock("@workspace/db", () => ({
  db: { insert: insertMock },
  // Rate limiting is covered in leads.rateLimit.test.ts; here the shared
  // store always reports the first hit of a fresh window.
  pool: { query: vi.fn(async () => ({ rows: [{ count: 1 }] })) },
  leadsTable: {},
}));

const sendLeadNotificationMock = vi.fn();
const sendVisitorConfirmationMock = vi.fn();
vi.mock("../lib/mailer", () => ({
  sendLeadNotification: sendLeadNotificationMock,
  sendVisitorConfirmation: sendVisitorConfirmationMock,
}));

const { default: app } = await import("../app");

const validBody = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "555-123-4567",
  message: "Please call me",
};

function persistedLead(overrides: Record<string, unknown> = {}) {
  return {
    id: 42,
    name: validBody.name,
    email: validBody.email,
    phone: validBody.phone,
    businessName: null,
    packageInterest: null,
    preferredTime: null,
    preferredDate: null,
    preferredSlot: null,
    message: validBody.message,
    createdAt: new Date("2026-07-22T00:00:00Z"),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  insertedRows.length = 0;
  returningMock.mockResolvedValue([persistedLead()]);
  sendLeadNotificationMock.mockResolvedValue("email-id");
});

describe("POST /api/leads", () => {
  it("returns 201 and persists the lead even when the mailer throws", async () => {
    sendLeadNotificationMock.mockRejectedValue(new Error("Resend API error 500"));

    const res = await request(app).post("/api/leads").send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(42);
    expect(res.body.name).toBe(validBody.name);
    // Lead was persisted despite the email failure
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(insertedRows[0]).toMatchObject({
      name: validBody.name,
      email: validBody.email,
      phone: validBody.phone,
    });
    expect(sendLeadNotificationMock).toHaveBeenCalledTimes(1);
  });

  it("returns 201 and persists the lead when the mailer times out", async () => {
    // Simulate the mailer's own timeout rejection surfacing to the route
    sendLeadNotificationMock.mockRejectedValue(
      new Error("Resend request timed out after 8000ms"),
    );

    const res = await request(app).post("/api/leads").send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(42);
    expect(insertMock).toHaveBeenCalledTimes(1);
  });

  it("honeypot submissions return a fake 201 but never email and never persist", async () => {
    const res = await request(app)
      .post("/api/leads")
      .send({ ...validBody, website: "http://spam.example" });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(0);
    expect(sendLeadNotificationMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects invalid payloads with 400 without emailing", async () => {
    const res = await request(app).post("/api/leads").send({ name: "x" });

    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
    expect(sendLeadNotificationMock).not.toHaveBeenCalled();
  });
});
