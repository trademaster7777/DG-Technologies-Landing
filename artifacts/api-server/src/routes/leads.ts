import { Router, type IRouter } from "express";
import { and, eq, isNotNull } from "drizzle-orm";
import { db, leadsTable } from "@workspace/db";
import {
  CreateLeadBody,
  CreateLeadResponse,
  GetBookedSlotsQueryParams,
  GetBookedSlotsResponse,
} from "@workspace/api-zod";
import { rateLimit } from "../lib/rateLimit";
import { sendLeadNotification, sendVisitorConfirmation } from "../lib/mailer";

const router: IRouter = Router();

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

  res.json(
    GetBookedSlotsResponse.parse({
      bookedSlots: rows.map((r) => r.slot).filter((s): s is string => !!s),
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
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (parsed.data.preferredDate < today) {
      res
        .status(400)
        .json({ error: "The preferred call date can't be in the past" });
      return;
    }
  }

  // Honeypot: real visitors never fill this hidden field. Pretend success
  // so bots can't tell they were filtered, but store nothing.
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

export default router;
