import { ReplitConnectors } from "@replit/connectors-sdk";

export interface LeadEmailData {
  id: number;
  name: string;
  email: string;
  phone: string;
  businessName: string | null;
  packageInterest: string | null;
  message: string | null;
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
    row("Message", lead.message) +
    `</table>` +
    `<p style="color:#6b7280;font-size:13px;margin:16px 0 0;">Reply to this email to answer ${escapeHtml(lead.name)} directly.</p>` +
    `</div>`;

  // Fresh client per send — the SDK resolves identity/tokens per request and
  // must not be cached across token expiry.
  const connectors = new ReplitConnectors();

  let timer: NodeJS.Timeout | undefined;
  try {
    const response = await Promise.race([
      connectors.proxy("resend", "/emails", {
        method: "POST",
        body: {
          from,
          to,
          reply_to: lead.email,
          subject,
          text: textLines.join("\n"),
          html,
        },
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
