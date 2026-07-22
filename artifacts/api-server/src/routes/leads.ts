import { Router, type IRouter } from "express";
import { and, eq, isNotNull } from "drizzle-orm";
import { db, leadsTable } from "@workspace/db";
import { timingSafeEqual } from "node:crypto";
import {
  CreateLeadBody,
  CreateLeadResponse,
  GetBookedSlotsQueryParams,
  GetBookedSlotsResponse,
  ReleaseLeadBookingParams,
  ReleaseLeadBookingResponse,
} from "@workspace/api-zod";
import { rateLimit } from "../lib/rateLimit";
import { verifyTurnstileToken, usingTestTurnstileKeys } from "../lib/turnstile";
import { sendLeadNotification, sendVisitorConfirmation } from "../lib/mailer";
import { isSlotAvailable } from "../lib/availability";

const router: IRouter = Router();

// Slot dates/times are interpreted in the business owner's timezone, set via
// BUSINESS_TIMEZONE (IANA name, e.g. "America/New_York"). Falls back to the
// server's timezone when unset — deployments often run in UTC, so setting it
// is recommended.
const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE || undefined;

// Calendar date (YYYY-MM-DD) and wall-clock time (HH:MM) in the business
// timezone — the clock all date/slot comparisons in this file use.
function localDateString(now: Date): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
function localTimeString(now: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: BUSINESS_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
}

// All bookable slot start times (must mirror the preferredSlot enum in the
// API schema).
const ALL_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

// A slot is in the past when its date is today and its start time (HH:MM)
// has already been reached. Slot strings sort lexicographically as times.
function slotHasPassed(date: string, slot: string, now: Date): boolean {
  return date === localDateString(now) && slot <= localTimeString(now);
}

// Two-layer rate limiting. Offices, mobile carriers, and VPNs put many
// legitimate visitors behind one IP, so the per-IP limit is generous and
// mostly guards against floods. The tighter limit is per email address, so
// one over-eager submitter can't lock out their coworkers.
const ipLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 20 });
const emailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    const email = (req.body as { email?: unknown } | undefined)?.email;
    if (typeof email !== "string" || email.trim() === "") {
      // No usable email — validation will reject the request anyway.
      return null;
    }
    return `email:${email.trim().toLowerCase()}`;
  },
});

router.get("/leads/slots", async (req, res): Promise<void> => {
  const parsed = GetBookedSlotsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "A valid date (YYYY-MM-DD) is required" });
    return;
  }

  const rows = await db
    .select({ slot: leadsTable.preferredSlot })
    .from(leadsTable)
    .where(
      and(
        eq(leadsTable.preferredDate, parsed.data.date),
        isNotNull(leadsTable.preferredSlot),
      ),
    );

  // For today, also report slots whose start time has already passed as
  // unavailable, so clients can't offer them even if they skip their own
  // client-side filtering.
  const now = new Date();
  const passedSlots = ALL_SLOTS.filter((slot) =>
    slotHasPassed(parsed.data.date, slot, now),
  );

  res.json(
    GetBookedSlotsResponse.parse({
      bookedSlots: [
        ...new Set([
          ...rows.map((r) => r.slot).filter((s): s is string => !!s),
          ...passedSlots,
        ]),
      ],
    }),
  );
});

router.post("/leads", ipLimiter, emailLimiter, async (req, res): Promise<void> => {
  const parsed = CreateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid lead submission");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Honeypot: real visitors never fill this hidden field. Checked before the
  // Turnstile round-trip so naive bots get the stealth fake-201 without us
  // spending a Cloudflare verification on them. Pretend success so bots
  // can't tell they were filtered, but store nothing.
  if (parsed.data.website && parsed.data.website.trim() !== "") {
    req.log.warn("Honeypot triggered; discarding lead submission");
    res.status(201).json(
      CreateLeadResponse.parse({
        id: 0,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        businessName: null,
        packageInterest: null,
        preferredTime: null,
        preferredDate: null,
        preferredSlot: null,
        message: null,
        createdAt: new Date(),
      }),
    );
    return;
  }

  // Bot challenge: every lead must carry a Turnstile token, and the token
  // must verify with Cloudflare. This is the backstop against bots that
  // rotate IPs and emails past the rate limiters. If Cloudflare itself is
  // unreachable (or the secret is misconfigured) we fail open — losing spam
  // protection briefly is better than losing real leads.
  // (Schema requires the token; the blank check guards whitespace-only.)
  if (parsed.data.turnstileToken.trim() === "") {
    req.log.warn("Lead submission missing Turnstile token; rejecting");
    res.status(403).json({
      error: "Bot check missing — please reload the page and try again",
    });
    return;
  }
  const turnstile = await verifyTurnstileToken(
    parsed.data.turnstileToken,
    req.ip,
  );
  if (turnstile.outcome === "fail") {
    req.log.warn(
      { errorCodes: turnstile.errorCodes },
      "Turnstile verification failed; rejecting lead submission",
    );
    res.status(403).json({
      error: "Bot check failed — please reload the page and try again",
    });
    return;
  }
  if (turnstile.outcome === "unavailable") {
    req.log.error(
      { reason: turnstile.reason },
      "Turnstile verification unavailable; accepting lead without bot check",
    );
  } else if (usingTestTurnstileKeys()) {
    req.log.warn(
      "TURNSTILE_SECRET_KEY not set; using Cloudflare test keys (challenge always passes)",
    );
  }

  // Slot sanity: a slot without a date is meaningless, and past dates can't
  // be booked. Compare against the local calendar date to avoid timezone
  // edge cases rejecting "today".
  if (parsed.data.preferredSlot && !parsed.data.preferredDate) {
    res
      .status(400)
      .json({ error: "A time slot requires a date to go with it" });
    return;
  }
  if (parsed.data.preferredDate) {
    const now = new Date();
    const today = localDateString(now);
    if (parsed.data.preferredDate < today) {
      res
        .status(400)
        .json({ error: "The preferred call date can't be in the past" });
      return;
    }
    // Same-day bookings must still be in the future: the form hides slots
    // that already started, but direct API calls need the same guard.
    if (
      parsed.data.preferredSlot &&
      slotHasPassed(parsed.data.preferredDate, parsed.data.preferredSlot, now)
    ) {
      res
        .status(400)
        .json({ error: "That time slot has already passed today" });
      return;
    }
  }
  // The slot must fall within the owner's configured availability for that
  // day of the week — the same schedule the form offers.
  if (
    parsed.data.preferredSlot &&
    parsed.data.preferredDate &&
    !isSlotAvailable(parsed.data.preferredDate, parsed.data.preferredSlot)
  ) {
    res.status(400).json({
      error: "That time slot isn't available on the selected day",
    });
    return;
  }

  let lead;
  try {
    [lead] = await db
      .insert(leadsTable)
      .values({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        businessName: parsed.data.businessName ?? null,
        packageInterest: parsed.data.packageInterest ?? null,
        preferredTime: parsed.data.preferredTime ?? null,
        preferredDate: parsed.data.preferredDate ?? null,
        preferredSlot: parsed.data.preferredSlot ?? null,
        message: parsed.data.message ?? null,
      })
      .returning();
  } catch (err) {
    // Unique index on (preferred_date, preferred_slot) makes double-booking
    // race-safe: the second concurrent insert fails with 23505.
    if (
      err &&
      typeof err === "object" &&
      ((err as { code?: string }).code === "23505" ||
        (err as { cause?: { code?: string } }).cause?.code === "23505")
    ) {
      req.log.warn(
        {
          preferredDate: parsed.data.preferredDate,
          preferredSlot: parsed.data.preferredSlot,
        },
        "Slot already booked; rejecting lead submission",
      );
      res.status(409).json({
        error:
          "That time slot was just booked by someone else — please pick another one",
      });
      return;
    }
    throw err;
  }

  req.log.info({ leadId: lead!.id }, "Lead captured");

  // Notify the owner before responding: on autoscale deployments, work that
  // happens after the response is sent can be throttled or killed. The lead
  // is already saved — an email failure is only logged, never surfaced.
  try {
    const emailId = await sendLeadNotification({
      id: lead!.id,
      name: lead!.name,
      email: lead!.email,
      phone: lead!.phone,
      businessName: lead!.businessName,
      packageInterest: lead!.packageInterest,
      preferredTime: lead!.preferredTime,
      preferredDate: lead!.preferredDate,
      preferredSlot: lead!.preferredSlot,
      message: lead!.message,
    });
    if (emailId) {
      req.log.info({ leadId: lead!.id, emailId }, "Lead notification email sent");
    } else {
      req.log.warn(
        { leadId: lead!.id },
        "LEAD_NOTIFY_EMAIL not set; lead notification email skipped",
      );
    }
  } catch (err) {
    req.log.error(
      { err, leadId: lead!.id },
      "Failed to send lead notification email",
    );
  }

  // Confirm to the visitor as well. Same isolation: a failure here is only
  // logged and never breaks lead capture. Skipped entirely when no verified
  // sender is configured (LEAD_FROM_EMAIL unset) — the shared resend.dev
  // sender cannot email arbitrary visitor addresses.
  try {
    const confirmationId = await sendVisitorConfirmation({
      id: lead!.id,
      name: lead!.name,
      email: lead!.email,
      phone: lead!.phone,
      businessName: lead!.businessName,
      packageInterest: lead!.packageInterest,
      preferredTime: lead!.preferredTime,
      preferredDate: lead!.preferredDate,
      preferredSlot: lead!.preferredSlot,
      message: lead!.message,
    });
    if (confirmationId) {
      req.log.info(
        { leadId: lead!.id, emailId: confirmationId },
        "Visitor confirmation email sent",
      );
    } else {
      req.log.warn(
        { leadId: lead!.id },
        "LEAD_FROM_EMAIL not set; visitor confirmation email skipped",
      );
    }
  } catch (err) {
    req.log.error(
      { err, leadId: lead!.id },
      "Failed to send visitor confirmation email",
    );
  }

  res.status(201).json(CreateLeadResponse.parse(lead));
});

// Admin: release a lead's booked slot so it becomes bookable again.
// Guarded by ADMIN_TOKEN — a shared secret only the owner knows. Constant-time
// comparison avoids leaking the token via response timing.
router.delete("/leads/:id/booking", async (req, res): Promise<void> => {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    res.status(503).json({
      error: "Admin actions are unavailable: ADMIN_TOKEN is not configured",
    });
    return;
  }

  const provided = req.get("x-admin-token") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(adminToken);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    req.log.warn("Rejected admin booking release: bad admin token");
    res.status(401).json({ error: "Invalid admin token" });
    return;
  }

  const parsedParams = ReleaseLeadBookingParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: "A valid numeric lead id is required" });
    return;
  }

  // Only rows that actually hold a slot are updated, so a missing lead and a
  // lead without a booking both fall through to 404.
  const [updated] = await db
    .update(leadsTable)
    .set({ preferredDate: null, preferredSlot: null })
    .where(
      and(
        eq(leadsTable.id, parsedParams.data.id),
        isNotNull(leadsTable.preferredSlot),
      ),
    )
    .returning();

  if (!updated) {
    res
      .status(404)
      .json({ error: "No booking found for that lead" });
    return;
  }

  req.log.info(
    { leadId: updated.id },
    "Booking released; slot is available again",
  );
  res.json(ReleaseLeadBookingResponse.parse(updated));
});

export default router;
