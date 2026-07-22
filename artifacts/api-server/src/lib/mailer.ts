import { ReplitConnectors } from "@replit/connectors-sdk";
import { getBusinessTimezoneLabel } from "./availability";

export interface LeadEmailData {
  id: number;
  name: string;
  email: string;
  phone: string;
  businessName: string | null;
  packageInterest: string | null;
  preferredTime: string | null;
  preferredDate: string | null;
  preferredSlot: string | null;
  message: string | null;
}

const PREFERRED_TIME_LABELS: Record<string, string> = {
  morning: "Morning (before 12pm)",
  afternoon: "Afternoon (12–5pm)",
  evening: "Evening (after 5pm)",
};

function preferredTimeLabel(value: string | null): string | null {
  if (!value) return null;
  return PREFERRED_TIME_LABELS[value] ?? value;
}

/**
 * Human-friendly "Tuesday, July 28 at 2:00 PM" label for a lead's chosen
 * date + slot. Returns null when no date was picked; a date without a slot
 * renders just the date.
 */
function scheduledSlotLabel(
  date: string | null,
  slot: string | null,
): string | null {
  if (!date) return null;
  const [y, m, d] = date.split("-").map(Number);
  const dateLabel = new Date(Date.UTC(y!, m! - 1, d!)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  if (!slot) return dateLabel;
  const [hh, mm] = slot.split(":").map(Number);
  const hour12 = ((hh! + 11) % 12) + 1;
  const ampm = hh! < 12 ? "AM" : "PM";
  return `${dateLabel} at ${hour12}:${String(mm!).padStart(2, "0")} ${ampm} ${getBusinessTimezoneLabel()}`;
}

const EMAIL_TIMEOUT_MS = 8_000;
const DEFAULT_FROM = "D2G Technology <onboarding@resend.dev>";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function row(label: string, value: string | null): string {
  if (!value) return "";
  return (
    `<tr>` +
    `<td style="padding:6px 16px 6px 0;color:#6b7280;font-size:14px;white-space:nowrap;vertical-align:top;">${label}</td>` +
    `<td style="padding:6px 0;color:#111827;font-size:14px;">${escapeHtml(value)}</td>` +
    `</tr>`
  );
}

/**
 * Email the business owner about a newly captured lead via the Resend
 * connector.
 *
 * Returns the Resend email id on success, or `null` when no recipient is
 * configured (LEAD_NOTIFY_EMAIL unset). Throws on delivery errors — callers
 * decide whether that failure is fatal (for lead capture it never is).
 */
export async function sendLeadNotification(
  lead: LeadEmailData,
): Promise<string | null> {
  const to = process.env.LEAD_NOTIFY_EMAIL;
  if (!to) {
    return null;
  }
  const from = process.env.LEAD_FROM_EMAIL || DEFAULT_FROM;

  const subject = lead.packageInterest
    ? `New call request from ${lead.name} (${lead.packageInterest})`
    : `New call request from ${lead.name}`;

  const textLines = [
    `New call request from your website:`,
    ``,
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email}`,
    lead.businessName ? `Business: ${lead.businessName}` : null,
    lead.packageInterest ? `Package interest: ${lead.packageInterest}` : null,
    scheduledSlotLabel(lead.preferredDate, lead.preferredSlot)
      ? `Requested call slot: ${scheduledSlotLabel(lead.preferredDate, lead.preferredSlot)}`
      : null,
    lead.preferredTime
      ? `Best time to call: ${preferredTimeLabel(lead.preferredTime)}`
      : null,
    lead.message ? `` : null,
    lead.message ? `Message:` : null,
    lead.message ? lead.message : null,
    ``,
    `Reply to this email to answer ${lead.name} directly.`,
  ].filter((line): line is string => line !== null);

  const html =
    `<div style="font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:520px;">` +
    `<h2 style="color:#111827;font-size:18px;margin:0 0 4px;">New call request</h2>` +
    `<p style="color:#6b7280;font-size:14px;margin:0 0 16px;">Someone just asked for a call through your website.</p>` +
    `<table style="border-collapse:collapse;">` +
    row("Name", lead.name) +
    row("Phone", lead.phone) +
    row("Email", lead.email) +
    row("Business", lead.businessName) +
    row("Package", lead.packageInterest) +
    row(
      "Requested call slot",
      scheduledSlotLabel(lead.preferredDate, lead.preferredSlot),
    ) +
    row("Best time to call", preferredTimeLabel(lead.preferredTime)) +
    row("Message", lead.message) +
    `</table>` +
    `<p style="color:#6b7280;font-size:13px;margin:16px 0 0;">Reply to this email to answer ${escapeHtml(lead.name)} directly.</p>` +
    `</div>`;

    return sendEmail({
    from,
    to,
    reply_to: lead.email,
    subject,
    text: textLines.join("\n"),
    html,
  });
}

/**
 * Send a short branded confirmation to the visitor who just booked a call.
 *
 * Returns the Resend email id on success, or `null` when no verified sender
 * is configured — the shared onboarding@resend.dev sender cannot email
 * arbitrary visitor addresses, so this requires LEAD_FROM_EMAIL to be set to
 * an address on a Resend-verified domain. Throws on delivery errors — callers
 * must treat those as non-fatal for lead capture.
 */
export async function sendVisitorConfirmation(
  lead: LeadEmailData,
): Promise<string | null> {
  const from = process.env.LEAD_FROM_EMAIL;
  if (!from) {
    return null;
  }

  const firstName = lead.name.trim().split(/\s+/)[0] || lead.name;
  const slotLabel = scheduledSlotLabel(lead.preferredDate, lead.preferredSlot);
  const subject = slotLabel
    ? `Your call is requested for ${slotLabel}`
    : "Thanks — we'll call you within one business day";

  const textLines = [
    `Hi ${firstName},`,
    ``,
    slotLabel
      ? `Thanks for requesting a call with D2G Technology — we've received your details and we'll call you at ${lead.phone} on ${slotLabel}. If anything comes up on our end, we'll reach out to reschedule.`
      : lead.preferredTime
      ? `Thanks for requesting a call with D2G Technology — we've received your details and we'll call you at ${lead.phone} within one business day, aiming for your preferred time: ${preferredTimeLabel(lead.preferredTime)?.toLowerCase()}.`
      : `Thanks for requesting a call with D2G Technology — we've received your details and we'll call you at ${lead.phone} within one business day.`,
    lead.packageInterest ? `` : null,
    lead.packageInterest
      ? `You mentioned you're interested in: ${lead.packageInterest}. We'll come prepared to talk it through.`
      : null,
    ``,
    `If anything changes in the meantime, just reply to this email.`,
    ``,
    `Talk soon,`,
    `The D2G Technology team`,
  ].filter((line): line is string => line !== null);

  const html =
    `<div style="font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:520px;">` +
    `<h2 style="color:#111827;font-size:18px;margin:0 0 4px;">Thanks, ${escapeHtml(firstName)} — you're booked in</h2>` +
    `<p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 12px;">${
      slotLabel
        ? `We've received your details and we'll call you at <strong>${escapeHtml(lead.phone)}</strong> on <strong>${escapeHtml(slotLabel)}</strong>.`
        : `We've received your details and we'll call you at <strong>${escapeHtml(lead.phone)}</strong> within one business day.`
    }${
      !slotLabel && lead.preferredTime
        ? ` We'll aim for your preferred time: <strong>${escapeHtml(preferredTimeLabel(lead.preferredTime) ?? "")}</strong>.`
        : ""
    }</p>` +
    (lead.packageInterest
      ? `<p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 12px;">You mentioned you're interested in <strong>${escapeHtml(lead.packageInterest)}</strong> — we'll come prepared to talk it through.</p>`
      : "") +
    `<p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">If anything changes in the meantime, just reply to this email.</p>` +
    `<p style="color:#6b7280;font-size:13px;margin:0;">Talk soon,<br/>The D2G Technology team</p>` +
    `</div>`;

  return sendEmail({
    from,
    to: lead.email,
    subject,
    text: textLines.join("\n"),
    html,
  });
}

interface SendEmailPayload {
  from: string;
  to: string;
  reply_to?: string;
  subject: string;
  text: string;
  html: string;
}

async function sendEmail(payload: SendEmailPayload): Promise<string> {
  // Fresh client per send — the SDK resolves identity/tokens per request and
  // must not be cached across token expiry.
  const connectors = new ReplitConnectors();

  let timer: NodeJS.Timeout | undefined;
  try {
    const response = await Promise.race([
      connectors.proxy("resend", "/emails", {
        method: "POST",
        body: payload,
      }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new Error(`Resend request timed out after ${EMAIL_TIMEOUT_MS}ms`),
            ),
          EMAIL_TIMEOUT_MS,
        );
      }),
    ]);

    if (!response.ok) {
      const errText = await response.text().catch(() => "<unreadable body>");
      throw new Error(
        `Resend API error ${response.status}: ${errText.slice(0, 500)}`,
      );
    }

    const data = (await response.json()) as { id?: string };
    return data.id ?? "unknown";
  } finally {
    if (timer) clearTimeout(timer);
  }
}
