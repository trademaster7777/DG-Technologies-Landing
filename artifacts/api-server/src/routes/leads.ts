import { Router, type IRouter } from "express";
import { db, leadsTable } from "@workspace/db";
import { CreateLeadBody, CreateLeadResponse } from "@workspace/api-zod";
import { rateLimit } from "../lib/rateLimit";
import { sendLeadNotification } from "../lib/mailer";

const router: IRouter = Router();

const leadsLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 5 });

router.post("/leads", leadsLimiter, async (req, res): Promise<void> => {
  const parsed = CreateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid lead submission");
    res.status(400).json({ error: parsed.error.message });
    return;
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
        message: null,
        createdAt: new Date(),
      }),
    );
    return;
  }

  const [lead] = await db
    .insert(leadsTable)
    .values({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      businessName: parsed.data.businessName ?? null,
      packageInterest: parsed.data.packageInterest ?? null,
      message: parsed.data.message ?? null,
    })
    .returning();

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

  res.status(201).json(CreateLeadResponse.parse(lead));
});

export default router;
