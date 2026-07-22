/**
 * Cloudflare Turnstile server-side verification.
 *
 * Turnstile is an invisible/low-friction bot challenge: the browser widget
 * produces a one-time token, and the server confirms it with Cloudflare
 * before accepting the submission. This stops bots that rotate IPs and
 * email addresses, which slip past rate limiting and the honeypot.
 *
 * Keys: set TURNSTILE_SECRET_KEY (and VITE_TURNSTILE_SITE_KEY on the web
 * app) to real Cloudflare keys in production. When unset, Cloudflare's
 * official always-pass test keys are used so development and preview work
 * end-to-end without any account setup.
 */

const TEST_ALWAYS_PASS_SECRET = "1x0000000000000000000000000000000AA";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function usingTestTurnstileKeys(): boolean {
  return !process.env.TURNSTILE_SECRET_KEY;
}

export type TurnstileResult =
  | { outcome: "pass" }
  | { outcome: "fail"; errorCodes: string[] }
  /** Cloudflare unreachable or returned garbage — caller decides policy. */
  | { outcome: "unavailable"; reason: string };

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<TurnstileResult> {
  // The always-pass test secret is a dev/preview convenience only. In
  // production a missing secret must not silently masquerade as a working
  // bot check — surface it as "unavailable" so the route logs an error on
  // every lead until real keys are configured.
  if (usingTestTurnstileKeys() && process.env.NODE_ENV === "production") {
    return {
      outcome: "unavailable",
      reason: "TURNSTILE_SECRET_KEY not set in production; bot check disabled",
    };
  }

  try {
    const body = new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY ?? TEST_ALWAYS_PASS_SECRET,
      response: token,
    });
    if (remoteIp) body.set("remoteip", remoteIp);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return { outcome: "unavailable", reason: `siteverify HTTP ${res.status}` };
    }
    const data = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };
    if (data.success === true) return { outcome: "pass" };

    const errorCodes = data["error-codes"] ?? [];
    // These codes mean *we* couldn't be validated (bad secret / internal
    // error), not that the visitor is a bot. Treat as unavailable so a
    // misconfigured secret doesn't block every real lead.
    const configErrors = ["invalid-input-secret", "missing-input-secret", "internal-error"];
    if (errorCodes.some((c) => configErrors.includes(c))) {
      return { outcome: "unavailable", reason: errorCodes.join(",") };
    }
    return { outcome: "fail", errorCodes };
  } catch (err) {
    return {
      outcome: "unavailable",
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}
